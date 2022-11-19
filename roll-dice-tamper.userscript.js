// ==UserScript==
// @name         Roll20 Dice Tamper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Me
// @match        https://app.roll20.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=roll20.net
// @grant        GM_addStyle
// @grant        GM.addStyle
// @run-at       document-start
// @noframes
// ==/UserScript==

'use strict'
;(function () {
	var OrigWebSocket = window.WebSocket
	var callWebSocket = OrigWebSocket.apply.bind(OrigWebSocket)
	var wsAddListener = OrigWebSocket.prototype.addEventListener
	wsAddListener = wsAddListener.call.bind(wsAddListener)
	window.WebSocket = function WebSocket(url, protocols) {
		var ws
		if (!(this instanceof WebSocket)) {
			// Called without 'new' (browsers will throw an error).
			ws = callWebSocket(this, arguments)
		} else if (arguments.length === 1) {
			ws = new OrigWebSocket(url)
		} else if (arguments.length >= 2) {
			ws = new OrigWebSocket(url, protocols)
		} else {
			// No arguments (browsers will throw an error)
			ws = new OrigWebSocket()
		}

		wsAddListener(ws, 'message', function (event) {
			// TODO: Do something with event.data (received data) if you wish.
		})
		return ws
	}.bind()
	window.WebSocket.prototype = OrigWebSocket.prototype
	window.WebSocket.prototype.constructor = window.WebSocket

	var wsSend = OrigWebSocket.prototype.send
	wsSend = wsSend.apply.bind(wsSend)
	OrigWebSocket.prototype.send = function (data) {
		try {
			data = JSON.parse(data)
			console.log('[HACK] Data:', data)

			if (data.d?.b?.d?.type === 'rollresult') {
				let content = JSON.parse(data.d.b.d.content)

				console.log(
					'%c[HACK] Log result found',
					'color:cyan',
					data,
					content,
					this,
					arguments
				)

				content.rolls[0].results[0].v = 10 // Roll result
				content.total = 10 // Summation result of all dice
				data.d.b.d.content = JSON.stringify(content)
				// data.d.b.d.signature = "5bf76585b54a94247256692144cadf5dc64a23613167ad0f119e8e12c123d7865a167a57a24214a8dc8eaf0c4eb633e5f2399a40850b0d78dd65d0386ddc5b72";
				// data.d.b.d.tdseed = 1719927481513178400;
				arguments[0] = JSON.stringify(data)
				console.log(
					'%c[HACK] Replaced result',
					'color: #00ff00',
					data,
					content,
					this,
					arguments
				)
			}
		} catch (_) {
			console.error('[HACK] ERROR:', _)
		}

		// TODO: Do something with the sent data if you wish.
		return wsSend(this, arguments)
	}
})()
