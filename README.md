## About

Simple discord bot that will serve the need to show info about the cs server with the command `++acfun`.

# Initial setup of project

[Repo link](https://github.com/Arxero/mavbot)

[Setup discord.js with Typescript](https://www.freecodecamp.org/news/build-a-100-days-of-code-discord-bot-with-typescript-mongodb-and-discord-js-13/)

[ESLint Typescript](https://typescript-eslint.io/docs/linting/)

[Use ESLint with TypeScript](https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/)

[Use Prettier with ESLint and TypeScript in VSCode](https://khalilstemmler.com/blogs/tooling/prettier/)


For your changes to take effect, use 

    npm run build
    npm run start

# Discord bot guides

[Docs](https://discord.js.org/#/docs/discord.js/stable/general/welcome)

[Guide](https://discordjs.guide/creating-your-bot/creating-commands.html#command-deployment-script)

# Steam master server quering
[Master Server Query Protocol](https://developer.valvesoftware.com/wiki/Master_Server_Query_Protocol#Sample_query)

[Server queries](https://developer.valvesoftware.com/wiki/Server_queries)

[Game dig](https://www.npmjs.com/package/gamedig)

# Hosting
## [Get NodeJS (Option 3)](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)

        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
        source ~/.bashrc
        nvm list-remote
        nvm install v16.15.1
        node -v

`nvm list` - shows the currently active version on the first line

You can switch between installed versions with `nvm use`

    nvm use v16.15.1

The correct version of Node is installed on our machine as we expected. A compatible version of npm is also available.
## Setup bot

    su steam
    cd ~
    git clone https://github.com/Arxero/mavbot.git

Give fle permission to the folder you are in, first go in the parent folder of `mavbot`

    sudo chmod -R 777 mavbot/

Install npm packages

    cd mavbot
    npm i

Run bot
This will make `dist` folder from which actual js files will be executed. You would need to run it (then stop it, just to recompile the new changes into js files) everytime when you do `git pull`/update the bot form the repo.

    npm run build

Create `.env` file with the bot secrets

    nano .env
    
Start the bot and logged in the discord server

    npm run start

## Run thge bot in the background with [Screen](https://linuxize.com/post/how-to-use-linux-screen/)

List screen sessions

    screen -ls

Create new `screen` session named mavbot

    cd mavbot
    screen -A -m -d -S mavbot npm run start

or

    cd mavbot && screen -A -m -d -S mavbot npm run start

Kill `mavbot` session

    screen -X -S mavbot kill

Reattach to the screen session by typing
    
    screen -r mavbot

Use the key sequence `Ctrl-a` + `Ctrl-d` to detach from the screen session.

## Update with new version
    cd mavbot
    git fetch --all
    git reset --hard origin/master
    git pull
    git build
    screen -A -m -d -S mavbot npm run start

## Startup script

1. Create start.sh file in the home directory for example

        cd /home/steam
        sudo nano mavbot.sh

2. Give start.sh file permissions to be executable

         sudo chmod +x mavbot.sh

3. Update `mavbot.sh` with the following:

```sh
screen -X -S mavbot kill
cd /home/steam/mavbot
screen -A -m -d -S mavbot npm run start
echo "==========Mavbot has been booted=========="
```
4. Run `mavbot.sh` script on system startup

[Run a Script on Startup in Linux](https://www.baeldung.com/linux/run-script-on-startup)
### Using cron

First login as the user you want to execute the script from, then open crontab and add the required line at the bottom of the file

    crontab -e
    @reboot sh /home/steam/mavbot.sh

### Using service

    cd /etc/systemd/system
    sudo nano mavbot.service

```ini
[Unit]
Description=Reboots Mavbot.  

[Service]
Type=simple
ExecStart=/bin/bash /home/steam/mavbot.sh           

[Install]
WantedBy=multi-user.target
```

    chmod 644 /etc/systemd/system/mavbot.service
    sudo systemctl enable mavbot.service


### Update npm packages

1. Use [npm-check-updates](https://www.npmjs.com/package/npm-check-updates)

-   to see updatable packages

          ncu

-   to update them

          ncu -u

### Kill Mavbot process
- htop
- F4
- search for it and copy `PID`
- exit and use

        kill -9 PID

- where `PID` is the id you copied from htop

### Fix (for column) Incorrect string value: '\xD0\x92\xD1\x96\xD0\xBA...'
- SHOW CREATE TABLE mavbot.player_sessions;

        ALTER TABLE mavbot.player_sessions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

### [How to Add arial font to Ubuntu - related ot canvas service](https://askubuntu.com/questions/651441/how-to-install-arial-font-and-other-windows-fonts-in-ubuntu)

    sudo apt install ttf-mscorefonts-installer
    sudo fc-cache -f

in a terminal.

After that, check with

    fc-match Arial


## PM2 notes
### Start the process

Navigate to the directory where your application is located and run the following command:

    pm2 start npm --name "mavbot" -- start

### List running pm2 processes

    pm2 list

### Stop a process

    pm2 stop <app_name|app_id>

### Restart a process: 

    pm2 restart <app_name|app_id>

