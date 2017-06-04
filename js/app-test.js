/**
 * Created by eduardotorres on 5/29/17.
 */

// global variables.
var FOURSQUAREID = "Z2L1F3ZVLJBK3VHDGG4F0D1P2LJ4DG4KVESBX3MJ1F1OBGMM";
var FOURSQUARESECRET = "U05NAGAM1P1BVWM4ZTXJYVLBVOZBTBOXAX2VFJWVBVGZ1QQA";
var FOURSQUAREV = "20170101";
var DETROITCORDINATES = {lat: 42.3338889, lng: -083.0477778};
var map;

// data model
var initialLocations = [
    {
        name: 'The Fillmore Detroit',
        lat: 42.337969,
        lng: -83.051722

    },
    {
        name: 'Cobo Center',
        lat: 42.328129,
        lng: -83.049173
    },
    {
        name: 'Renaissance Center',
        lat: 42.3283711,
        lng: -83.03996660000001
    },
    {
        name: 'Compuware World Headquarters',
        lat: 42.3323961,
        lng: -83.04701890000001
    },
    {
        name: 'Comerica Park',
        lat: 42.339293,
        lng: -83.04887289999999
    },
    {
        name: 'Fox Theatre',
        lat: 42.3383102,
        lng: -83.05266619999998
    }
];


var myLocations = function (data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.lng = data.lng;
    this.urlOficial = "";
    this.phone = "";
    this.visible = ko.observable(true);
    this.image = "";

    //put markers on maps
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.lng),
        map: map,
        title: data.name,
        animation: null
    });
    // construct the info for Foursquare api.
    var fourSquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' +
        this.lng + '&client_id=' + FOURSQUAREID + '&client_secret=' + FOURSQUARESECRET + '&v=' + FOURSQUAREV + '&query=' + this.name;

    // construct info for flickr api
    var flickrURL = "https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
    var flickrOptions = {
        tags: self.name,
        format: "json"
    };

    // get info from the flickr api
    $.getJSON(flickrURL, flickrOptions, function (eflicks) {
        var result = eflicks.items[0].media;
        self.image = result.m;
        console.log(self.image);
    }).fail(function () {
        alert('error occurred while getting data from flickr, try refreshing the page')
    });

    // get info from the foursquare api
    $.getJSON(fourSquareURL).done(function (e) {
        var results = e.response.venues[0];
        self.urlOficial = results.url;
        self.phone = results.contact.formattedPhone;
        if (typeof self.phone === 'undefined') {
            self.phone = 'Phone is not Provided'
        }
    }).fail(function () {
        alert('error occurred while getting data from foursquare, try refreshing the page')
    });

    // make markers disappear when they are not selected in the search box
    this.hideMarker = ko.computed(function () {
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    // construct marker
    this.contentMarker = '';

    // add animation to the market and set all the data from the APIs in order to be displayed when someone click on a marker.
    this.marker.addListener('click', function () {
        if (this.getAnimation() !== null) {
            this.setAnimation(null);
        } else {
            this.setAnimation(google.maps.Animation.BOUNCE);
        }

        self.contentMarker = '<div class="demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--4-col-tabvar mdl-cell--12-col-desktop">' +
            '<div class="mdl-card__title mdl-card--expand mdl-color--white-300"><img src="' + self.image + '"><h2 class="mdl-card__title-text"></h2></div>' +
            '<div class="mdl-card__supporting-text mdl-color-text--grey-600">' + data.name + "</div>" +
            '<div class="mdl-card__supporting-text mdl-color-text--grey-600">' + " Phone" + " " + self.phone + "</div>" +
            '<div class="mdl-card__actions mdl-card--border"><a href=" ' + self.urlOficial + '" class="mdl-button mdl-js-button mdl-js-ripple-effect">Visit Website</a></div></div>';

        var infoWindow = new google.maps.InfoWindow({
            content: self.contentMarker
        });
        infoWindow.open(map, this);

        setTimeout(function () {
            self.marker.setAnimation(null);
        }, 2100);

    });

    this.showFromList = function (place) {
        console.log('I am in ' + this.name);
        google.maps.event.trigger(this.marker, 'click');
    };
};


var ViewModel = function () {
    var self = this;
    this.searchLocation = ko.observable("");
    this.location = ko.observableArray([]);

    // initialize google maps
    map = new google.maps.Map(document.getElementById('map'), {
        center: DETROITCORDINATES,
        zoom: 13
    });

    initialLocations.forEach(function (place) {
        self.location.push(new myLocations(place));
    });

    // implement the search function
    this.filterList = ko.computed(function () {
        var filter = self.searchLocation().toLowerCase();
        if (!filter) {
            self.location().forEach(function (locationItem) {
                locationItem.visible(true);
            });
            return self.location();
        } else {
            return ko.utils.arrayFilter(self.location(), function (locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);


};

function appInit() {
    ko.applyBindings(new ViewModel());
}

function errorHandling() {
    alert("Google Maps is not loading at the moment, please try again in a few minutes");
}