Game - Panda Run
By - Narcis-Andrei Tataranu

-------------------------------------------------------------------------------------------------------------------
About game:
In this thrilling adventure, you take on the role of a hungry panda dashing through a lush forest in search of food. Your health is steadily depleting, and your only hope for survival is to find and eat bamboo, the perfect panda treat! But beware, scattered throughout the forest are tempting yet harmful chocolates that you must avoid at all costs. Every piece of bamboo you consume restores your health, giving you the strength to continue. Can you navigate the wilderness, dodge the dangers, and satisfy your hunger? Test your reflexes, and determination in this exciting survival journey!
-------------------------------------------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------------------------
Game Controls:

---> Space Bar: Press to jump to the food.
---> Esc: Press to pause or un-pause the game.
-------------------------------------------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------------------------
File structure:
WEB-GAME  
--> myGame  
    --> static  
        --> Assets  
            --> 3D_objects  
                --> Bamboo.glb  
                --> Chocolate.glb  
                --> Jump.glb  
                --> Panda.glb  
                --> Running.glb  
                --> Ter1.glb  
            --> Images  
                --> galaxy.jpg  
            --> Sound  
                --> GameOver.mp3  
                --> Music.mp3  
                --> Music2.mp3  
                --> Nom.mp3  
                --> Ough.mp3  
            --> Textures  
                --> T_PandaW_B.png  
    --> 404.html  
    --> game.html  
    --> game.js  
    --> index.html  
    --> loadGamePage.html  
    --> loading.js  
    --> login.css  
    --> login.html  
    --> register.css  
    --> score.css  
    --> score.html  
    --> signin.html  
    --> styles.css  
    --> app.js  
--> node_modules  
--> Powerpoint  
--> package-lock.json  
--> package.json  
--> README.txt  
--> setPath.bat  
-------------------------------------------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------------------------
Database:

Table: user

Field Name   | Data Type    | Collation         | Attributes | Null | Default | Comments | Extra          
-----------------------------------------------------------------------------------------------
ID           | int(11)      |                   |            | No   | None    |          | AUTO_INCREMENT
email        | varchar(255) | latin1_swedish_ci |            | No   | None    |          |                
password     | varchar(255) | latin1_swedish_ci |            | No   | None    |          |                
score        | int(11)      |                   |            | No   | None    |          |                
name         | varchar(50)  | latin1_swedish_ci |            | Yes  | NULL    |          |                
health       | int(11)      |                   |            | No   | None    |          |                
-------------------------------------------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------------------------
Some key points I achieved:
	·Data storage implementation - game score is structured and saved on the server side. 
	·Game score for the players’ login data can be reloaded correctly.
	·Game data storage is secured and not able to be access without authentication.
	·Game loading page is fully working.
	·User data is encrypted and stored securely on the server side.
	·Game audio: audio (music and sound) is working and can be used in the game.
	·Using physics that affected the game. 
	·Has a systematic game messaging design. Passing the data using suitable client-server communication methods in a correct way. 
-------------------------------------------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------------------------
References: 
https://stackoverflow.com/questions/52385027/why-and-when-asynchronous-code-is-non-blocking
https://stackoverflow.com/questions/72048929/javascript-run-callback-after-all-fetch-requests-to-finish-in-multiple-for-loo
https://www.youtube.com/watch?v=fAeTptQ69eg
https://www.youtube.com/watch?v=OFpqvaJ3QYg
https://www.w3schools.com/jsref/met_audio_play.asp
https://www.geeksforgeeks.org/javascript-play-a-mp3-file-in-js/
https://www.w3schools.com/sql/
https://www.geeksforgeeks.org/sql-tutorial/
https://www.youtube.com/watch?v=HXV3zeQKqGY
https://threejs.org/docs/#examples/en/loaders/GLTFLoader
https://en.threejs-university.com/2021/08/04/loading-a-3d-glb-gltf-with-three-js-gltfloader/
https://www.youtube.com/watch?v=yPA2z7fl4J8
https://threejs.org/docs/#api/en/loaders/ImageLoader
https://threejs.org/manual/#en/textures
https://en.threejs-university.com/2021/08/03/chapter-5-creating-textures-with-three-js-the-basics/
https://stackoverflow.com/questions/42454942/how-to-create-colision-detection-with-3d-objects
https://stackoverflow.com/questions/48381967/three-js-collision-detection
https://www.youtube.com/watch?v=IG95gd5WRrg
https://www.youtube.com/watch?v=_MyPLZSGS3s
https://www.w3schools.com/js/js_asynchronous.asp
https://www.w3schools.com/Js/js_async.asp
https://coderspacket.com/posts/play-audio-after-page-load-in-javascript-4/#google_vignette
-------------------------------------------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------------------------
Contact: Narcis-Andrei.Tataranu@mail.bcu.ac.uk
-------------------------------------------------------------------------------------------------------------------

!!!!!!!!!!!!!!!!!MAKE SURE YOU HAVE bcrypt INSTALLED AND THE setPath.bat WITH THE CORRECT FILE PATH!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!I CHANGED THE setPath.bat AND IT SHOULD WORK WITH MY UNIVERSITY PC IN MP135!!!!!!!!!!!!!!!!!

npm install bcrypt
node myGame/app.js
or
node app.js


PATHS:

HOME
@cd C:\Users\andre\Desktop\Y2\Web-Game\myGame
@set PATH=C:\nodejs;%PATH%
@cmd.exe /K

MY UNI PC IN MP135
@cd C:\Users\S23162579\Desktop\Work\Web-Game\myGame
@set PATH=C:\nodejs;%PATH%
@cmd.exe /K
