/**
 * jQuery protoPlayer
 * @author dzonz
 */
(function($) {
    // Youtube API
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id))
            return;
        js = d.createElement(s);
        js.id = id;
        js.src = "//www.youtube.com/iframe_api";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'video-player-youtube'));
       
    // Vimeo API
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id))
            return;
        js = d.createElement(s);
        js.id = id;
        js.src = "//f.vimeocdn.com/js/froogaloop2.min.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'video-player-vimeo'));
    
    $.fn.protoPlayerAdapters = function() {

    };

// PLAYER ADAPTER INTERFACE
    var PlayerAdapterInterface = function($target) {
        this.decode = function(_video) {
        };
        this.render = function(_video, _params) {
        };
        this.remove = function() {
        };
        this.play = function() {
        };
    };

// PLAYER INTERFACE
    var PlayerInterface = function() {
        this.render = function(_video, _params, $target) {
        };
        this.validate = function(_video, _params) {
        };
        this.remove = function() {
        };
        this.play = function() {
        };
    };
    
// YOUTUBE
    var YoutubePlayer = function() {
        // check if script is loaded
        var _urlValidator = /((http|https):\/\/)?(?:[a-zA_Z]{2,3}.)?(?:youtube\.com\/watch\?)((?:[\w\d\-\_\=]+&amp;(?:amp;)?)*v(?:&lt;[A-Z]+&gt;)?=([0-9a-zA-Z\-\_]+))/i;
        var _player = null;

        this.render = function(_video, _params, $target) {
            // get video id
            _player = new YT.Player($target, {
                height: '400',
                width: '640',
                videoId: _thisPlayer.validate(_video),
                allowFullscreen: true,
                events: {
                    onStateChange: function onPlayerStateChange(event) {
                        if (event.data == YT.PlayerState.ENDED) {

                        }
                    }
                }, playerVars: {
                    autoplay: 1,
                    controls: 0,
                    //disablekb: 1,
                    enablejsapi: 1,
                    rel: 0,
                    showinfo: 0,
                    modestbranding: 1
                }
            });
        };

        this.validate = function(url) {
            var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
            var match = url.match(regExp);
            if (match && match[7].length == 11) {
                return match[7];
            } else {
                return false;
            }
        };

        var _thisPlayer = this;
    };
    YoutubePlayer.prototype = new PlayerInterface();

// VIMEO
    var VimeoPlayer = function() {
        var _player = null;
        var _iframe = null;
        var status = null;

        this.render = function(_video, _params, $target) {
            // get video id
            var _videoID = _thisPlayer.validate(_video);
            $('#' + $target).html('<iframe id="' + $target + '_vimeo_player" src="//player.vimeo.com/video/' + _videoID + '?api=1&player_id=' + $target + '_vimeo_player" width="630" height="354" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
            _iframe = $($target + '_vimeo_player')[0];
            _player = $f(iframe);
        };

        this.validate = function(url) {
            var regExp = /^.*((vimeo.com\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
            var match = url.match(regExp);
            if (match && match[7].length > 0) {
                return match[7];
            } else {
                return false;
            }
        };

        var _thisPlayer = this;
    };
    VimeoPlayer.prototype = new PlayerInterface();

// AVAILABLE PLAYERS
    var availablePlayers = {
        'youtube': YoutubePlayer,
        'vimeo': VimeoPlayer
    };

    var _decodePlayer = function(video) {
        for (var playerKey in $.fn.protoPlayer.players) {
            var playerObject = new $.fn.protoPlayer.players[playerKey];
            if (playerObject.validate(video)) {
                return playerObject;
            }
        }

        return false;
    };

// PLAYER ADAPTER
    var PlayerAdapter = function($target) {
        var _player = null;

        this.render = function(_video, _params) {
            _player = _decodePlayer(_video);
            _player.render(_video, _params, $target.data('player'));
        };

        this.play = function() {
            _player.play();
        };
    };
    PlayerAdapter.prototype = new PlayerAdapterInterface();

// HTML Player Adapter
    var HTMLPlayer = function($target) {
        var _playerAdapter = new PlayerAdapter($target);

        this.render = function(_video, _params) {
            _playerAdapter.render(_video, _params);
        };
    };
    HTMLPlayer.prototype = new PlayerAdapterInterface();

    var _controllerClass = function($target, _settings) {
        var _instance = null;
        var _player = null;

        this.settings = function(newSettings) {
            _instance = $.extend(_instance, newSettings);
        };

        this.render = function(_video, _videoParams) {
            if (_player) {
                _player.remove();
            }

            _player = new HTMLPlayer($target);
            _player.render(_video, _videoParams);
        };

        this.play = function() {
            if (_player) {
                _player.play();
            }
        };

        this.open = function() {
            $target.protoDialog('open');
        };

        this.close = function() {
            $target.protoDialog('close');
        };

        var _this = this;

        this.settings(_settings);

        $target.protoDialog({
            onInit: function($dialog) {
                $dialog.addClass('proto-player-overlay');
                _instance.onInit.call($target, $dialog, _instance)
            },
            onOpen: function($dialog) {
                _instance.onOpen.call($target, $dialog, _instance)
            },
            onOpened: function($dialog) {
                _instance.onOpened.call($target, $dialog, _instance)
            },
            onClose: function($dialog) {
                _instance.onClose.call($target, $dialog, _instance)
            },
            onClosed: function($dialog) {
                _instance.onClosed.call($target, $dialog, _instance)
            },
            onResize: function($dialog) {
                var $content = $dialog.find('.proto-dialog-content');
                $dialog.find('.video-container iframe, .video-container object, .video-container embed').each(function () {
                    $(this).css({
                        'width': $content.width() + 'px',
                        'height': $content.height() + 'px'
                    });
                });
            }
        });
    };

    var methods = {
        init: function(options) {
            var _settings = $.extend({
                onInit: function($dialog) {
                },
                onOpen: function($dialog) {
                },
                onOpened: function($dialog) {
                },
                onClose: function($dialog) {
                },
                onClosed: function($dialog) {
                },
                onResize: function($dialog) {
                }
            }, options);

            return this.each(function() {
                var $this = $(this);
                var _data = $this.data('protoPlayer');

                // If the plugin hasn't been initialized yet
                if (!_data) {
                    // search for elements
                    var _controller = new _controllerClass($this, _settings);

                    _data = {
                        target: $this,
                        settings: _settings,
                        controller: _controller
                    };
                } else {
                    _data = $(this).data('protoPlayer');
                    _data['settings'] = _settings;
                    _data['controller'].settings(_settings);
                }

                $(this).data('protoPlayer', _data);
            });
        },
        open: function(_settings) {
            return this.each(function() {
                var $this = $(this);
                var _data = $this.data('protoPlayer');
                // If the plugin hasn't been initialized yet
                if (_data) {
                    // search for elements
                    var _controller = _data['controller'];
                    _controller.open();
                }
            });
        },
        close: function( ) {
            return this.each(function() {
                var $this = $(this);
                var _data = $this.data('protoPlayer');

                // If the plugin hasn't been initialized yet
                if (_data) {
                    // search for elements
                    var _controller = _data['controller'];
                    _controller.close();
                }
            });
        },
        settings: function(_settings) {
            return this.each(function() {
                var $this = $(this);
                var _data = $this.data('protoPlayer');

                // If the plugin hasn't been initialized yet
                if (_data) {
                    // search for elements
                    var _controller = _data['controller'];
                    _data['settings'] = _settings;
                    $this.data('protoPlayer', _data);
                    _controller.settings(_settings);
                }
            });
        },
        render: function(_video, _playerParams) {
            return this.each(function() {
                var $this = $(this);
                var _data = $this.data('protoPlayer');
                // If the plugin hasn't been initialized yet
                if (_data) {
                    // search for elements
                    var _controller = _data['controller'];
                    _controller.render(_video, _playerParams);
                }
            });
        }

    };

    $.fn.protoPlayer = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.protoPlayer');
        }
    };

    $.fn.protoPlayer.players = availablePlayers;

})(jQuery); // pass the jQuery object to this function
