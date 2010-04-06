/********** Worker.Land **********
* Auto-buys property
*/
var Land = new Worker('Land', 'town_land');
Land.option = {
	buy:true,
	wait:48,
	best:null,
	onlyten:false
};

Land.runtime = {
	lastlevel:0,
	best:null,
	buy:0,
	cost:0
};

Land.display = [
	{
		id:'buy',
		label:'Auto-Buy Land',
		checkbox:true
	},{
		id:'wait',
		label:'Maximum Wait Time',
		select:[0, 24, 36, 48],
		suffix:'hours',
		help:'There has been a lot of testing in this code, it is the fastest way to increase your income despite appearances!'
	},{
		advanced:true,
		id:'onlyten',
		label:'Only buy 10x<br>NOTE: This is slower!!!',
		checkbox:true
	}
];

Land.parse = function(change) {
	$('tr.land_buy_row,tr.land_buy_row_unique').each(function(i,el){
		var name = $('img', el).attr('alt'), tmp;
		Land.data[name] = {};
		Land.data[name].income = $('.land_buy_info .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
		Land.data[name].max = $('.land_buy_info', el).text().regex(/Max Allowed For your level: ([0-9]+)/i);
		Land.data[name].cost = $('.land_buy_costs .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
		tmp = $('option', $('.land_buy_costs .gold', el).parent().next()).last().attr('value');
		if (tmp) {
			Land.data[name].buy = tmp;
		}
		Land.data[name].own = $('.land_buy_costs span', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
	});
	return false;
};

Land.update = function() {
	var i, worth = Bank.worth(), income = Player.get('income') + Player.get('average_income'), best, buy = 0;
	for (var i in this.data) {
		if (this.data[i].buy) {
			if (!best || ((this.data[best].cost / income) + (this.data[i].cost / (income + this.data[best].income))) > ((this.data[i].cost / income) + (this.data[best].cost / (income + this.data[i].income)))) {
				best = i;
			}
		}
	}
	if (best) {
		if (this.option.onlyten || (this.data[best].cost * 10) <= worth || (this.data[best].own >= 10 && this.data[best].cost * 10 / income < this.option.wait)) {
			buy = Math.min(this.data[best].max - this.data[best].own, 10);
		} else if ((this.data[best].cost * 5) <= worth || (this.data[best].own >= 10 && this.data[best].cost * 5 / income < this.option.wait)) {
			buy = Math.min(this.data[best].max - this.data[best].own, 5);
		} else {
			buy = 1;
		}
		this.runtime.buy = buy;
		this.runtime.cost = buy * this.data[best].cost;
		Dashboard.status(this, buy + 'x ' + best + ' for $' + addCommas(buy * this.data[best].cost));
	} else {
		Dashboard.status(this);
	}
	this.runtime.best = best;
}

Land.work = function(state) {
	if (!this.runtime.buy || !this.runtime.best || !Bank.worth(this.runtime.cost)) {
		if (!this.runtime.best && this.runtime.lastlevel < Player.get('level')) {
			if (!state || !Page.to('town_land')) {
				return true;
			}
			this.runtime.lastlevel = Player.get('level');
		}
		return false;
	}
	if (!state || !Bank.retrieve(this.runtime.cost) || !Page.to('town_land')) {
		return true;
	}
//	var el = $('tr.land_buy_row:contains("'+this.runtime.best+'"),tr.land_buy_row_unique:contains("'+this.runtime.best+'")');
	$('tr.land_buy_row,tr.land_buy_row_unique').each(function(i,el){
		if ($('img', el).attr('alt') === Land.runtime.best) {
			debug('Land: Buying ' + Land.runtime.buy + ' x ' + Land.runtime.best + ' for $' + addCommas(Land.runtime.cost));
			$('select', $('.land_buy_costs .gold', el).parent().next()).val(Land.runtime.buy > 5 ? 10 : (Land.runtime.buy > 1 ? 5 : 1));
			Page.click($('.land_buy_costs input[name="Buy"]', el));
			$('#'+PREFIX+'Land_current').text('None');
		}
	});
	return true;
};
