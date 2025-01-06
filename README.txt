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
