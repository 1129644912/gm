// ==UserScript==
// @name             ��Ƶվ����html5������
// @description      ������ ������html5��������������ҳȫ������ӿ�ݼ�����������ˡ���ͣ/���š���������һ�����л�(��ҳ)ȫ��������֡�������ٶȡ�֧����Ƶվ�㣺��.����QQ��Bվ�����ˡ�΢����������Ƶ[���֡��ƿ��á�����]���Ѻ������ӡ����С��ٶ�����Ƶ�ȣ�ֱ�������㡢��è��YY�����������顣���Զ���վ��
// @version          0.81
// @homepage         http://bbs.kafan.cn/thread-2093014-1-1.html
// @include          *://pan.baidu.com/*
// @include          *://yun.baidu.com/*
// @include          *://v.qq.com/*
// @include          *://v.sports.qq.com/*
// @include          *://film.qq.com/*
// @include          *://view.inews.qq.com/*
// @include          *://news.qq.com/*
// @include          https://www.weiyun.com/video_*
// @include          *://v.youku.com/v_show/id_*
// @include          *://*.tudou.com/v/*
// @include          *://www.bilibili.com/*
// @include          *://v.163.com/*.html*
// @include          *://ent.163.com/*.html*
// @include          *://news.163.com/*.html*
// @include          *://news.163.com/special/*
// @include          *://study.163.com/course/*.htm?courseId=*
// @include          *://news.sina.com.cn/*
// @include          *://video.sina.com.cn/*
// @include          *://video.sina.cn/*
// @include          *://weibo.com/*
// @include          *://*.weibo.com/*
// @include          *://*.le.com/*.html*
// @include          *://*.lesports.com/*.html*
// @include          *://tv.sohu.com/*.shtml*
// @include          *://*.tv.sohu.com/*.shtml*
// @include          *://film.sohu.com/album/*
// @include          *://www.fun.tv/vplay/*
// @include          *://m.fun.tv/*
// @include          *://www.yy.com/*
// @include          *://www.huya.com/*
// @include          https://www.douyu.com/*
// @include          https://www.panda.tv/*
// @include          *://star.longzhu.com/*
// @grant            unsafeWindow
// @grant            GM_addStyle
// @grant            GM_registerMenuCommand
// @grant            GM_setValue
// @grant            GM_getValue
// @run-at           document-start
// @namespace  https://greasyfork.org/users/7036
// @updateURL  https://raw.githubusercontent.com/xinggsf/gm/master/��Ƶվh5.user.js
// ==/UserScript==
'use strict';
if (window.chrome)
	NodeList.prototype[Symbol.iterator] = HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

const w = unsafeWindow,
noopFn = () => {},
q = css => document.querySelector(css),
$$ = (c, cb = e=>e.remove()) => {
	if (!c.length) return;
	if (typeof c === 'string')
		c = document.querySelectorAll(c);
	if (cb) for (let e of c) {
		if (e && cb(e)===false) break;
	}
	return c;
},
r1 = (regp, s) => regp.test(s) && RegExp.$1,
sleep = ms => new Promise(resolve => {
	setTimeout(resolve, ms);
}),
getStyle = (o, s) => {
    if (o.style[s]) return o.style[s];
    if (getComputedStyle) {//DOM
		var x = getComputedStyle(o, '');
		//s = s.replace(/([A-Z])/g,'-$1').toLowerCase();
		return x && x.getPropertyValue(s);
	}
},
injectJS = s => {
	const js = document.createElement('script');
	if (s.startsWith('http')) js.src = s;
	else js.textContent = s;
	document.head.appendChild(js);
},
throttle = function(fn, delay = 100){ //��������
	let timer = null, me = this;
	return function(...args) {
		timer && clearTimeout(timer);
		timer = setTimeout(() => {
			fn.apply(me, args);
			timer = null;
		}, delay);
	};
},
willRemove = throttle($$),//�ദͬʱ����ʱ���ֹ��ʱ����ͻ
doClick = e => {
	if (e) { e.click ? e.click() : e.dispatchEvent(new MouseEvent('click')) };
},
underFirefox57 = (() => {
	const x = r1(/Firefox\/(\d+)/, navigator.userAgent);
	return x && x < 57;
})(),
fakeUA = ua => Object.defineProperty(navigator, 'userAgent', {
	value: ua,
	writable: false,
	configurable: false,
	enumerable: true
}),
getMainDomain = host => {
	let a = host.split('.'),
	i = a.length -2;
	if (['com','tv','net','org','gov','edu'].includes(a[i])) i--;
	return a[i];
},
ua_samsung = 'Mozilla/5.0 (Linux; U; Android 4.0.4; GT-I9300 Build/IMM76D) AppleWebKit/534.30 Version/4.0 Mobile Safari/534.30',
ua_chrome = 'Mozilla/5.0 (Windows NT 10.0; WOW64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.9',
ua_ipad2 = 'Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3';

class FullScreen {
	constructor(video) {
		this._video = video;
		const d = document;
		this._exitFn = d.exitFullscreen || d.webkitExitFullscreen || d.mozCancelFullScreen || d.msExitFullscreen;

		const e = video;
		this._enterFn = e.requestFullscreen || e.webkitRequestFullScreen || e.mozRequestFullScreen || e.msRequestFullScreen;
	}

	static isFull() {
		const d = document;
		return !!(d.fullscreen || d.webkitIsFullScreen || d.mozFullScreen ||
		d.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement);
	}

	enter() {
		this._enterFn && this._enterFn.call(this._video);
	}

	exit() {
		this._exitFn && this._exitFn.call(document);
	}

	toggle() {
		FullScreen.isFull() ? this.exit() : this.enter();
	}
}

//������ҳȫ��,����ο��ˣ�https://github.com/gooyie/ykh5p
class FullPage {
	constructor(video) {
		this._video = video;
		console.log(video);
		this._checkContainer();
		GM_addStyle(`
			.z-top {
				position: relative !important;
				z-index: 23333333 !important;
			}
			.webfullscreen {
				display: block !important;
				position: fixed !important;
				width: 100% !important;
				height: 100% !important;
				top: 0 !important;
				left: 0 !important;
				background: #000 !important;
				z-index: 23333333 !important;
			}
		`);
	}

	_checkContainer() {
		const e = this._video;
		if (!this._container || this._container === e)
			this._container = FullPage.getPlayerContainer(e);
	}

	get container() {
		this._checkContainer();
		return this._container;
	}

	static getPlayerContainer(video) {
		let d = document.body,
		e = video,
		p = e.parentNode;
		if (p === d) return e;
		const w = p.clientWidth,
		h = p.clientHeight;
		do {
			e = p;
			p = e.parentNode;
		} while (p !== d && p.clientWidth - w < 5 && p.clientHeight - h < 5);
		return e;
	}

	fixView() {
		let e = this._video, c = this._container;
		if (e === c) return;
		if (e.clientWidth < c.clientWidth || e.clientHeight < c.clientHeight) {
			let a = [];
			while (e !== c) {
				a.push(e);
				e = e.parentNode;
			}
			while (e = a.pop()) e.style.width = e.style.height = '100%';
		}
	}

	static isFull(video) {
		return window.innerWidth -video.clientWidth < 5 && window.innerHeight - video.clientHeight < 5;
	}

	toggle() {
		const d = document.body,
		state = FullPage.isFull(this.container);
		d.style.overflow = state ? '' : 'hidden';
		this.container.classList.toggle('webfullscreen');

		let p = this.container.parentNode;
		while (p !== d) {
			p.classList.toggle('z-top');
			p = p.parentNode;
		}

		!state && setTimeout(this.fixView.bind(this), 9);
	}
}

let v, _fp, _fs;

const { host, pathname: path } = location,
u = getMainDomain(host),//������
//�������Ǽ��¼��������еĻص�
events = {
	on(name, fn) {
		this[name] = fn;
	}
},
app = {
	isLive: !1,
	vList: null,
	getVideos() {
		this.vList = this.vList || document.getElementsByTagName('video');
		if (v.offsetWidth>1) return;
		for (let e of this.vList) if (e.offsetWidth>1) {
			e.playbackRate = v.playbackRate;
			e.volume = v.volume;
			v = e;
			break;
		}
	},
	_convertView(btn) {
		(!btn.nextSibling || btn.clientWidth >1 || getStyle(btn, 'display') !== 'none') ? doClick(btn) : doClick(btn.nextSibling);
	},
	onCanplay(ev) {
		console.log('�ű�[����html5������]���¼�loadeddata');
		//if (ev.target.readyState > 2)
		events.canplay && events.canplay();
		ev.target.removeEventListener('loadeddata', this.onCanplay);
	},
	hotKey(e) {
		//�ж�ctrl,alt,shift����״̬����ֹ�������ݼ���ռ��
		if (e.ctrlKey || e.altKey || /INPUT|TEXTAREA/.test(e.target.nodeName))
			return;
		if (e.shiftKey && ![13,37,39].includes(e.keyCode))
			return;
		if (this.isLive && [37,39,78,88,67,90].includes(e.keyCode))
			return;
		this.getVideos();
		this.checkUI();
		let n;
		switch (e.keyCode) {
		case 32: //space
			if (this.disableSpace) return;
			v.paused ? v.play() : v.pause();
			e.preventDefault();
			break;
		case 37: //left
			n = e.shiftKey ? -27 : -5; //����5��,shift����
		case 39: //right
			n = n || (e.shiftKey ? 27 : 5); //���5��,shift����
			v.currentTime += n;
			break;
		case 78: // N ��һ��
			doClick(this.btnNext);
			break;
		//case 80: // P ��һ��
		case 38: //������
			n = 0.1;
		case 40: //������
			n = n || -0.1;
			n += v.volume;
			if (0 <= n && n <= 1) v.volume = n;
			e.preventDefault();
			e.stopPropagation();
			break;
		case 13: //ȫ��
			if (e.shiftKey) {
				_fp ? _fp.toggle() : this.fullPage();
			} else {
				_fs ? _fs.toggle() : this.fullScreen();
			}
			break;
		case 27: //esc
			if (FullScreen.isFull()) {
				_fs ? _fs.exit() : this.fullScreen();
			} else if (FullPage.isFull(v)) {
				_fp ? _fp.toggle() : this.fullPage();
			}
			break;
		case 67: //����C�����ٲ��� +0.1
			n = 0.1;
		case 88: //����X�����ٲ��� -0.1
			n = n || -0.1;
			n += v.playbackRate;
			if (0 < n && n <= 16) v.playbackRate = n;
			break;
		case 90: //����Z�������ٶȲ���
			v.playbackRate = 1;
			break;
		case 70: //����F����һ֡
			n = 0.03;
		case 68: //����D����һ֡
			n = n || -0.03;
			if (!v.paused) v.pause();
			v.currentTime += n;
		}
	},
	checkUI() {
		if (!this.webfullCSS) {
			_fp = _fp || new FullPage(v);
		} else if (!this.btnWFS) {
			this.btnWFS = q(this.webfullCSS);
			this.fullPage = () => this._convertView(this.btnWFS);
		}
		if (this.nextCSS && !this.btnNext) this.btnNext = q(this.nextCSS);
		if (!this.fullCSS) {
			_fs = _fs ||  new FullScreen(v);
		} else if (!this.btnFS) {
			this.btnFS = q(this.fullCSS);
			this.fullScreen = () => this._convertView(this.btnFS);
		}
	},
	bindEvent() {
		this.onCanplay = this.onCanplay.bind(this);
		v.addEventListener('loadeddata', this.onCanplay);
		document.addEventListener('keydown', this.hotKey.bind(this));
		this.checkUI();
		events.foundMV && events.foundMV();
	},
	findMV() {
		return q('video');
	},
	init() {
		document.addEventListener('DOMContentLoaded', () => {
			if (v = this.findMV()) this.bindEvent();
			else {
				this.observer = new MutationObserver(records => {
					if (v = this.findMV()) {
						this.observer.disconnect();
						delete this.observer;
						this.bindEvent(v);
					}
					if (this.adsCSS) willRemove(this.adsCSS);
					if (events.observe && events.observe()) delete events.observe;
				});
				this.observer.observe(document.body, {childList : true, subtree : true});
			}
			events.DOMReady && events.DOMReady();
		});
	}
};

let router = {
	qq() {
		Object.assign(app, {
			disableSpace: true,
			nextCSS: '.txp_btn_next',
			webfullCSS: '.txp_btn_fake',
			fullCSS: '.txp_btn_fullscreen',
		});
		events.on('canplay', app.getVideos);
		fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:48.0) Gecko/20100101 Firefox/48.0');
	},
	youku() {
		events.on('foundMV', () => {
			//ʹ�����ſᲥ����YAPfY��չ
			if (!app.btnFS) {
				app.webfullCSS = '.ABP-Web-FullScreen';
				app.fullCSS = '.ABP-FullScreen';
			}
		});
		events.on('canplay', () => {
			$$('.youku-layer-logo, .settings-item.disable');//ȥˮӡ��  �ƽ�1080P
			w.$('.quality-dashboard.larger').append('<div data-val=1080p class=settings-item data-eventlog=xsl>1080p</div>');
			if (v.src.startsWith('http')) app.getVideos();//��ʼ��vList���ɰ���flv.js~��ַ��blob:��ͷ
			//������һ����ť��Ч yk-trigger-layer
			const btn = q('button.control-next-video');
			if (btn && btn.offsetWidth>1) {
				let e = q('.program.current');
				e = e && e.closest('.item') || q('.item.current');
				e = e.nextSibling;
				if (!e) return;
				e = e.querySelector('a');//��һ����Ƶ����
				btn.addEventListener('click', ev => e.click());
				app.btnNext = e;
			}
		});
		app.fullCSS = '.control-fullscreen-icon';
	},
	bilibili() {
		if (!window.ReadableStream)
			injectJS('https://raw.githubusercontent.com/creatorrr/web-streams-polyfill/master/dist/polyfill.min.js');
		localStorage.bilibililover = 'YESYESYES';
		localStorage.defaulth5 = 1;
		app.nextCSS = '.bilibili-player-video-btn-next';
		app.webfullCSS = '.bilibili-player-video-web-fullscreen';
		app.fullCSS = '.bilibili-player-iconfont-fullscreen';
		const _setPlayer = () => {
			w.scrollTo(0, q('#bofqi').parentNode.parentNode.offsetTop);
			doClick(q('i.bilibili-player-iconfont-widescreen.icon-24wideoff')); //������
			doClick(q('i.bilibili-player-iconfont-repeat.icon-24repeaton')); //��ѭ������
			doClick(q('i[name=ctlbar_danmuku_close]'));//�ص�Ļ
			// doClick(q('li.bpui-selectmenu-list-row[data-value="64"]'));//720P��64  1080P��80
			setTimeout(doClick, 1500, q('i[name=play_button]'));//�Զ�����
		};
		const fn = history.pushState;
		history.pushState = function() {
			fn.apply(this, arguments);
			setTimeout(_setPlayer, 500);
		};
		events.on('canplay', _setPlayer);
	},
	sina() {
		fakeUA(ua_ipad2);
	},
	le() {
		fakeUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 Version/7.0.3 Safari/7046A194A');
		app.nextCSS = 'div.hv_ico_next';
		app.webfullCSS = 'span.hv_ico_webfullscreen';
		app.fullCSS = 'span.hv_ico_screen';
	},
	sohu() {
		fakeUA(ua_samsung);
		app.nextCSS = 'li.on[data-vid]+li a';
		app.fullCSS = 'div.x-fs-btn';
	},
	fun() {
		if (host.startsWith('m.')) {
			if (!path.includes('play')) return true;//�ǲ���ҳ����ִ��init()
			/^\/[mv]/.test(path) && location.assign(path.replace('/', '/i') + location.search);
			app.nextCSS = 'a.btn.next-btn';
			app.fullCSS = 'a.btn.full-btn';
			GM_addStyle('div.p-ip-wrap{overflow-y: auto !important;}');
			return;
		}
		let vid = r1(/\bv-(\d+)/, path);
		let mid = r1(/\bg-(\d+)/, path);
		//�缯path: /implay/������Ƶpath: /ivplay/
		if (vid) {
			mid && location.assign(`//m.fun.tv/implay/?mid=${mid}&vid=${vid}`);
			location.assign('//m.fun.tv/ivplay/?vid='+vid);
		}
		mid && setTimeout(() => {
			vid = w.vplay.videoid;
			vid && location.assign(`//m.fun.tv/implay/?mid=${mid}&vid=${vid}`);
		}, 99);
		return true;
	}
};
router.lesports = router.le;
router['163'] = router.sina;

if (!router[u]) { //ֱ��վ��
	router = {
		douyu() {
			let useDouyuExt = GM_getValue('useDouyuExt', !1),
			css = 'i.sign-spec',
			fnWrap = throttle($$),
			s = 'ʹ���˶���H5��������չ  ';
			s += useDouyuExt ? '��' : '��';
			GM_registerMenuCommand(s, () => {
				GM_setValue('useDouyuExt', !useDouyuExt);
				location.reload();
			});
			app.findMV = function() {
				fnWrap(css, e=>e.parentNode.remove());
				const p = w.__player || w.__playerindex;
				if (!p) return;
				if (path==='/') {//��ҳ
					if (p.isSwitched) return q('video');
				}
				else if (useDouyuExt || p.isSwitched)
					return q('#js-room-video video');
				//��ֱ����ҳ�� !lastIndexOf('/') ���ж������: $ROOM?.room_id
				p.switchPlayer('h5');
				p.isSwitched = true;
			};
			events.on('canplay', function() {
				$$(app.adsCSS);
				$$(css, e=>e.parentNode.remove());
				if (path==='/') return;
				const player = v.parentNode.parentNode;
				s = `#${player.id}>div:not([class]):not([style]), #dialog-more-video~*`;
				setTimeout($$, 300, s);
				setTimeout($$, 3900, s);
			});
			document.addEventListener('visibilitychange', ev => {
				if (!document.hidden) {
					$$(app.adsCSS);
					$$(css, e=>e.parentNode.remove());
				}
			});
			app.webfullCSS = useDouyuExt ? 'a.danmu-fullpage' : 'div[title="��ҳȫ��"]';
			app.fullCSS = useDouyuExt ? 'a.danmu-fullscreen': 'div[title="����ȫ��"]';
			// .watermark-4231db, .animation_container-005ab7 +div
			app.adsCSS = '.box-19fed6, [class|=recommendAD], [class|=room-ad], #js-recommand>div:nth-of-type(2)~*, #dialog-more-video~*, .no-login, .pop-zoom-container,#js-chat-notice';
		},
		panda() {
			localStorage.setItem('panda.tv/user/player', '{"useH5player": true}');
			app.webfullCSS = '.h5player-control-bar-fullscreen';
			app.fullCSS = '.h5player-control-bar-allfullscreen';
			app.adsCSS = '.act-zhuxianmarch-container, #liveos-container, .ad-container, .room-banner-images';
			if (path!=='/') events.on('foundMV', () => {
				let fn, btnClose = q('a.room-chat-expand-btn');
				if (btnClose) {
					//������throttle����setTimeout
					fn = throttle(ev => btnClose.click(), 9);
					// fn = async ev => {
						// await sleep(9);
						// btnClose.click();
					// };
					app.btnWFS.addEventListener('click', fn);
					v.closest('.h5player-player-core-container').addEventListener('dblclick', fn);
				}
				setTimeout($$, 900, app.adsCSS);
			});
		},
		yy() {
			if (!window.chrome) fakeUA(ua_chrome);
			app.fullCSS = '.liveplayerToolBar-fullScreenBtn';
		},
		huya() {
			if (underFirefox57) return true;
			if (!window.chrome) fakeUA(ua_chrome);
			app.webfullCSS = '.player-fullpage-btn';
			app.fullCSS = '.player-fullscreen-btn';
			events.on('canplay', function() {
				if (w.TT_ROOM_DATA) setTimeout(() => {
					$$('.player-chest-login, #player-login-tip-wrap');
					const $ = w.$, channel = w.TT_ROOM_DATA.channel,
					$videotype = $('.player-videotype-cur');
					$(".player-videotype-list li").unbind('click')
					.click(function(e) {
						if ($(this).hasClass('on')) return;
						console.log(this);
						const rate = $(this).attr("ibitrate");
						w.vplayer.vcore.reqBitRate(rate, channel);
						$(this).siblings('.on').removeClass('on');
						$(this).addClass('on').parent().parent().hide();
						$videotype.text($(this).text());
					});
				}, 900);
			});
		},
		longzhu() {
			if (!window.chrome) fakeUA(ua_chrome);
			if (!window.ReadableStream)
				injectJS('https://raw.githubusercontent.com/creatorrr/web-streams-polyfill/master/dist/polyfill.min.js');
			app.fullCSS = '#screen_vk';
			//app.webfullCSS = '.full-screen-button-outer-box';
		}
	};

	if (router[u]) app.isLive = true;
}

router.baidu = router.weibo = noopFn;
!/bilibili|douyu|panda/.test(u) && Object.defineProperty(navigator, 'plugins', {
	get() {
		return { length: 0 };
	}
});
if (!router[u] || !router[u]()) app.init();