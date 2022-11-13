<h2 align="center">ROLL20 Dice Tamper</h2>

<p align="center"><b>DISCLAIMER</b>
    <br>
MADE TO BE USED FOR EDUCATIONAL PURPOSES ONLY.
</p>

---

## Context

<u>I'm not a cheater nor like cheating</u>.

I made this because one of my friends asked me to, so he could have a chance of winning an unfair game against a douchebag as the last resort. In the end, he won honestly with a good strategy! So even the most advantageous player can lose against someone with a good strategy (or good at making the opponent lose time. *Yikes*).

## Attack Idea

For convenience and to avoid filtering and taking too much time to test, I will use a user script to load the code. You can create an extension, use third-party software or use any other method to modify ongoing packages. But please, understand that using the navigator's API to access the page is recommended and allows you to encapsulate the functionality.

All right, after that clarification; the main idea on how to cheat on Roll20 is to tamper all the outgoing packages of the Web Socket connection and modify the dice results of the client to a specific number.
For that, the easiest way to cheat will be using [Tampermonkey](https://www.tampermonkey.net/) to execute a user script to hijack the `WebSocket` object prototype of the `window`.

After tampering `window.WebSocket.prototype.send` function that the page will use, we will need to check on every call the JSON data passed as an argument to the function. For this, we convert the string data to a JSON object and check if the exact keys are present: `d.b.d` and the `type` is equal to "`rollresult`" (*Why those weird key names?* [Backbone.js](https://backbonejs.org/))

After that, we need to also parse the string message content in `d.b.d.content` and then we can *finally* modify the roll results. From now on, I will call this `content`.

Modifying the roll value is the *easiest* part of all of this, inside the content is the key `total` and is the result of all dice. On top of that, you also need to modify the dice values that will show on top of the result (shown as a summation of all, eg. `1 + 5 + 10 = 16`). Those values are on the first element of the object array `rolls`, the object defines the number of dice thrown with the key `dice` and the results of every dice. Therefore, to summarise, the important part to modify are the values in `rolls[0].results[n].v`, results also being an object array, and v being the numerical value of the *n* dice.

Well, the hardest part of this is now how to bypass the verifications, due to the use of seed (`d.b.d.tdseed`), signature (`d.b.d.signature`) generated using [jsrsasign](https://github.com/kjur/jsrsasign) and roll ID (`content.rolls[0].rollid`) that also use, after throwing the dice, in a new post request to `/doroll`.

*So, with the most basic reverse engineering skills and maths, you can easily cheat... But can you also bypass verifications?*


## Problems/Limitations

**HOW IS CURRENTLY IMPLEMENTED, YOU WILL NOT SEE THE MODIFIED RESULTS ON *YOUR* CHAT.** - You will need to use two instances of the same page, one to throw the dice and the other to check their results.

- **Does not handle multiple dice:** I'm lazy and never cared.
- **Does not check dice type:** you can get a 10 playing a D4 dice, for example.
- **Roll dice number is seed dependent:** you need to hijack the seed algorithm to predict the seed number of the dice or at least get the matching values to generate "that" type of dice.
- **3D dice still show the real value:** you will still see the real number of the 3D dice thrown, and the other players will receive a package of the dice's seed, thus showing the real value. Most probably also needs to hijack their `three.js` implementation or the post request to `/doroll` (also with seed and signature).
- **Client-side verification:** all clients of the lobby (unsure of spectators) verify if the dice results are the same as the seed sent by the roller, as well as the signature. If the seed/signature does not match, an alert will appear under the roll result.

*Just for the record, their board/editor JS stack is composed of:*

- Vue + Pinia Store
- Backbone.js
- Jquery + Mustache
- Three.js
- (and probably more as I'm too lazy to scroll through modules)

## Preview

| Attacker   |      Users      |
|:--:|:--:|
| ![Attacker perspective](/.github/example_attacker.png) |    ![Normal user perspective](/.github/example_user.png)   |

---

## Acknowledgments

- [Rob W](https://stackoverflow.com/users/938089) for the [Web Socket prototype constructor hijack snipped](https://stackoverflow.com/a/31182643)
- “[How to cheat on Roll20.net](https://medium.com/@aaron.reyna/how-to-cheat-on-roll20-net-b68927d04479)” — Shows the same approach, modifying packages with a third-party program.
