(function($) {
	function MyOverlay(map, avatarPath, pinPath) {
		this.avatarPath = avatarPath;
		this.pinPath = pinPath;
		var container = $(map.getDiv());
		this.containerLeft = container.offset().left;
		this.containerTop = container.offset().top;
		this.map = map;
	}

	MyOverlay.prototype = new google.maps.OverlayView();

	MyOverlay.prototype.setLocation = function(location) {
		this.location = location;
	};

	MyOverlay.prototype.onAdd = function() {
		var markerHtml = '<div class="marker">' + '<img class="avatar" src="' + this.avatarPath + '" />' + '<img class="pin" src="' + this.pinPath + '" />' + '</div>';
		var marker = $(markerHtml).appendTo(this.getPanes().overlayLayer);
		this.marker = marker.css({
			'opacity': 0,
			'position': 'absolute'
		});
		this.marker.find('.avatar').css({
			'position': 'absolute',
			'top': -17,
			'border-radius': 20,
			'width': 48
		})
		this.markerWidth = marker.width();
		this.markerHeight = marker.height();
	};

	MyOverlay.prototype.resetPosition = function(location) {
		this.location = location ? location : this.location;
		var overlayProjection = this.getProjection();
		var position = overlayProjection.fromLatLngToDivPixel(this.location);
		this.marker.css({
			'top': position.y - this.markerHeight,
			'left': position.x - this.markerWidth / 2
		});
	};

	MyOverlay.prototype.draw = function() {
		this.resetPosition();
	};

	MyOverlay.prototype.hide = function(callback) {
		this.marker.animate({
			opacity: 0
		}, 2000, callback);
	};

	MyOverlay.prototype.show = function(callback) {
		this.marker.animate({
			opacity: 1
		}, 2000, callback);
	};

	MyOverlay.prototype.onRemove = function() {
		this.marker.remove();
	};

	function animate(map, startCityName, endCityName, overlay) {

		var geocoder = new google.maps.Geocoder();

		geocoder.geocode({
			'address': startCityName
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				startLocation = results[0].geometry.location;
				map.setCenter(startLocation);

				overlay.setLocation(startLocation);
				overlay.setMap(map);

				geocoder.geocode({
					'address': endCityName
				}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						endLocation = results[0].geometry.location;

						google.maps.event.addListenerOnce(map, 'idle', function() {
							overlay.show(function() {
								google.maps.event.addListenerOnce(map, 'idle', function() {
									overlay.hide();
								});
								map.panTo(endLocation);
								overlay.resetPosition(endLocation);
							});
						});
					} else {
						console.log("Geocode was not successful for the following reason: " + status);
					}
				});
			} else {
				console.log("Geocode was not successful for the following reason: " + status);
			}
		});
	}


	$.fn.fly = function(startCityName, endCityName, avatarPath, pinPath) {

		return this.each(function() {

			var mapElement = $(this);
			var mapOffset = mapElement.offset();
			var map = new google.maps.Map(this, {
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				zoom: 6
			});
			var overlay = new MyOverlay(map, avatarPath, pinPath);

			animate(map, startCityName, endCityName, overlay);
		});
	}
})(jQuery);