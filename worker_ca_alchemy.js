/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, unique, deleteElement, sum, findInArray, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Alchemy **********
* Get all ingredients and recipes
*/
var Alchemy = new Worker('Alchemy');
Alchemy.temp = null;

Alchemy.defaults['castle_age'] = {
	pages:'keep_alchemy'
};

Alchemy.data = {
	ingredients:{},
	summons:{},
	recipe:{}
};

Alchemy.option = {
	perform:false,
	hearts:false,
	summon:false
};

Alchemy.runtime = {
	best:null
};

Alchemy.display = [
	{
		id:'hearts',
		label:'Use Battle Hearts',
		checkbox:true
	},{
		id:'summon',
		label:'Use Summon Ingredients',
		checkbox:true
	}
];

Alchemy.parse = function(change) {
	this.data.ingredients = {};
	this.data.recipe = {};
	this.data.summons = {};
	var $elements = $('div.alchemyQuestBack,div.alchemyRecipeBack,div.alchemyRecipeBackMonster');
	if (!$elements.length) {
		console.log(warn(), 'Can\'t find any alchemy ingredients...');
//		Page.to('keep_alchemy', false); // Force reload
		return false;
	}
	$elements.each(function(i,el){
		var recipe = {}, title = $('div.recipeTitle', el).text().trim().replace('RECIPES: ','');
		if (title.indexOf(' (')>0) {
			title = title.substr(0, title.indexOf(' ('));
		}
		if ($(el).hasClass('alchemyQuestBack')) {
			recipe.type = 'Quest';
		} else if ($(el).hasClass('alchemyRecipeBack')) {
			recipe.type = 'Recipe';
		} else if ($(el).hasClass('alchemyRecipeBackMonster')) {
			recipe.type = 'Summons';
		}
		recipe.ingredients = {};
		$('div.recipeImgContainer', el).parent().each(function(i,el){
			var name = $('img', el).attr('src').filepart();
			recipe.ingredients[name] = ($(el).text().regex(/x(\d+)/) || 1);
			Alchemy.data.ingredients[name] = 0;// Make sure we know an ingredient exists
			if (recipe.type === 'Summons') {
				Alchemy.data.summons[name] = true;// Make sure we know an ingredient exists
			}
		});
		Alchemy.data.recipe[title] = recipe;
	});
	$('div.ingredientUnit').each(function(i,el){
		var name = $('img', el).attr('src').filepart();
		Alchemy.data.ingredients[name] = $(el).text().regex(/x(\d+)/);
	});
};

Alchemy.update = function(event) {
	var best = null, recipe = this.data.recipe, r, i;
	for (r in recipe) {
		if (recipe[r].type === 'Recipe') {
			best = r;
			for (i in recipe[r].ingredients) {
				if ((!this.option.hearts && i === 'raid_hearts.gif') || (!this.option.summon && this.data.summons[i]) || recipe[r].ingredients[i] > this.data.ingredients[i]) {
					best = null;
					break;
				}
			}
			if (best) {break;}
		}
	}
	this.runtime.best = best;
};

Alchemy.work = function(state) {
	if (!this.runtime.best) {
		return QUEUE_FINISH;
	}
	if (!state || !Page.to('keep_alchemy')) {
		return QUEUE_CONTINUE;
	}
	console.log(warn(), 'Perform - ' + this.runtime.best);
	if (!Page.click($('input[type="image"]', $('div.recipeTitle:contains("' + this.runtime.best + '")').next()))) {
		Page.reload(); // Can't find the recipe we just parsed when coming here...
	}
	return QUEUE_RELEASE;
};
