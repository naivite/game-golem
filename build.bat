@echo off
setlocal enableextensions

rem ----------------------------------------------------------------------
rem Please copy this section as "build.ini"
rem Edit to put in the correct paths for your system, and set options to 0 (disabled) or 1 (enabled) at need
goto ENDINI
[Golem]
; golem: absolute path to this development branch, include trailing \
golem:".\"

[TortoiseSVN]
; tortoise: if installed, allows the current Revision to be displayed
tortoise=0

[Chrome]
; chrome: path to google chrome.exe
; - winxp - C:\Documents and Settings\???\Local Settings\Application Data\Google\Chrome\chrome.exe
; - win7  - C:\Users\???\AppData\Local\Google\Chrome\Application\chrome.exe
; chrome_pack: build the packed extension (obtain GameGolem.pem from Rycochet)
chrome="chrome.exe"
chrome_pack=0

[Compiler]
; java: path to Java.exe
; compiler: path to Closure Compiler (http://code.google.com/closure/compiler/)
java="java.exe"
compiler=""

[Firefox]
; firefox: path to the firefox install of Golem, including filename
; - winxp - C:\Documents and Settings\???\AppData\Roaming\Mozilla\Firefox\Profiles\???.default\gm_scripts\rycochets_castle_age_gol\rycochets_castle_age_gol.user.js
; - win7  - C:\Users\???\AppData\Roaming\Mozilla\Firefox\Profiles\???.default\gm_scripts\rycochets_castle_age_gol\rycochets_castle_age_gol.user.js
firefox=""

[Wait]
; wait: wait for a keypress to quit
wait=1
:ENDINI

if EXIST "build.ini" (
	for /F "eol=; tokens=1,2 delims==" %%a in (build.ini) do (
		if NOT "%%b"=="" set %%a=%%~b
	)
) ELSE (
	set golem=.\
	set tortoise=0
	set chrome=1
	set chrome_pack=0
	set java=""
	set compiler=""
	set firefox=""
	set wait=1
)

rem ----------------------------------------------------------------------
rem Delete old files...
echo Deleting old user.js files
del /F /Q _normal.user.js _min.user.js .\chrome\GameGolem\golem.user.js

rem ----------------------------------------------------------------------
rem Latest revision known (once committed it will be out of date)
rem Must have TortoiseSVN installed for this to work!
if "%tortoise%"=="1" (
	echo Creating revision files from TortoiseSVN...
	SubWCRev.exe . _head_tortoise.tmpl _head_revision.js >nul
	SubWCRev.exe . .\chrome\manifest.tmpl .\chrome\GameGolem\manifest.json >nul
	SubWCRev.exe . .\chrome\update.tmpl .\chrome\update.xml >nul
)
rem ----------------------------------------------------------------------
rem _normal.user.js - Normal version
echo Joining files into _normal.user.js
type _head*.js >_normal.user.js 2>nul
type _main.js >>_normal.user.js 2>nul
type css.js >>_normal.user.js 2>nul
type utility.js >>_normal.user.js 2>nul
type worker.js >>_normal.user.js 2>nul
type worker_*.js >>_normal.user.js 2>nul

rem ----------------------------------------------------------------------
rem .\chrome\GameGolem\golem.user.js - Google Chrome extension (unpacked)
echo Copying to .\chrome\GameGolem\golem.user.js
copy /Y _normal.user.js .\chrome\GameGolem\golem.user.js >nul 2>nul

rem ----------------------------------------------------------------------
rem .\chrome\GameGolem.crx - Google Chrome extension
rem To build the "proper" chrome extension you need Chrome installed
rem *NOTE*: Chrome *CANNOT* be running - http://code.google.com/p/chromium/issues/detail?id=22901
rem To get the GameGolem.pem file please ask Rycochet - and don't share it!!!
if "%chrome_pack%"=="1" (
	if EXIST "%chrome%" (
		if EXIST "%golem%chrome\GameGolem.pem" (
			echo Creating packed Chrome extension...
			"%chrome%" --no-message-box --pack-extension=%golem%chrome\GameGolem --pack-extension-key=%golem%chrome\GameGolem.pem
		) ELSE (
			echo You need to obtain chrome\GameGolem.pem from Rycochet to build the Chrome extension.
		)
	)
)

rem --------------------------------------------------------------------------------------
rem MINIMISED VERSION - This will fail on errors so use is advised - required for release!
rem Change path to compiler and source - obtain it from here:
rem http://code.google.com/closure/compiler/
if EXIST "%java%" (
	if EXIST "%compiler%" (
		echo Creating minimised version - will also show errors
		copy _head.js _min.user.js >nul
		"%java%" -jar "%compiler%" --js "_normal.user.js" >> _min.user.js"
	)
)

rem ----------------------------------------------------------------------
rem INSTALLED VERSION - Means you only need to hit F5 / refresh in Firefox
rem Just change the path to your firefox installed version, only the '???' should need changing on Windows7
if EXIST "%firefox%" (
	echo Installing new version to Firefox
	copy _normal.user.js "%firefox%" >nul
)

if "%wait%"=="1" (
	echo Press any key to quit.
	pause>nul
)