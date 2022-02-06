# HighLow

This README aims to cover the commands that the bot supports, as well as its general purpose. It will NOT cover the schemantics of the Value Betting Game.

## Description

This bot is used for the Value Game, hosted on the Value.GG discord server.
The game involves players taking turns betting, after which one guesses if their card was "higher or lower". 

## Commands

### !help
Displays the help for the bot. Not implemented yet.

### !bal, !balance
!bal or !balance will bring up the author's balance in an embed message with their profile picture. This embed message also shows their leaderboard position.

!bal @user or !balance @user will bring up the mentioned's balance in an embed message with their profile picture.
This embed message also shows their leaderboard position.

> *Only a user with staff privleges can preform this command.*

### !set
!set @user [number] will set a user's balance to a certain number.

> *Only a user with staff privleges can preform this command.*

### !give
!give @user [number] will give a user the number of chips specified.

> *Only a user with staff privleges can preform this command.*

### !remove
!remove @user [number] will take away the number of chips specified from a user.
> *Only a user with staff privleges can preform this command.*

### !lb, !leaderboard
!lb or !leaderboard will bring up a paginated leaderboard of the top 50 players who have the most chips.
There can be 10 users on 5 pages, for a max of 50 pages. Reactions are used to traverse the pages. 

### !duel
!duel @user will challenge the mentioned user to a duel. They will have 5 minutes to accept the duel using a reaction emoji.
If the mentioned user accepts, a new text channel is created under the category name "games".
The channel name will be the first 4 letters of both people's discord username with a space between them.

## Duels

Users are handed cards through private threads. In the private thread, they can press one of two buttons, to either redraw their card or ready for the game.
When both players are ready, the game starts. Players can either bet a number, or type "stop" or "pass" to end betting. These inputs are commandless.
After the betting phase, a message with two buttons is displayed, for the person who didn't pass to press.
After a selection is made, the winner is determimed, and the players' balances are changed accordingly.

## Changes Planned

1. Tournament Support
2. Custom Decks
3. Automoderation
4. Profiles
5. Bot Logs
6. Match History