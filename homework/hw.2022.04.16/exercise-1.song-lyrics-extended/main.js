const dataUrl = `./data`;
const collectionUrl = `${dataUrl}/collection.json`;

const nodes = {
    cover: document.querySelector('.cover'),
    output: document.querySelector('#output'),
    player: document.querySelector('#output .player'),
    artist: document.querySelector('#output .artist-name'),
    album: document.querySelector('#output .album-name'),
    song: document.querySelector('#output .song-name'),
    lyrics: document.querySelector('#output .song-lyrics'),
    btnLeft: document.querySelector('.nav-btn-left'),
    btnRight: document.querySelector('.nav-btn-right'),
    btnShow: document.querySelector('.nav-center'),
    imageContainer: document.querySelector('.image-container'),
    autoplaySwitch: document.querySelector('.auto-play'),
    lyricsSwitch: document.querySelector('.lyrics-switch')
};

const effectFadeOut = [
    { transform: 'rotate(0) scale(1)' },
    { transform: 'rotate(360deg) scale(0)' }
];

const effectFadeIn = [
    { transform: 'rotate(360deg) scale(0)' },
    { transform: 'rotate(0) scale(1)' }
];

const effectTiming = {
    duration: 500,
    iterations: 1,
    fill: 'forwards'
};

// Controller to reset the 'Show info' button - not used
// const controller = new AbortController();
// nodes.btnShow.addEventListener('click', showHideInfo, { signal: controller.signal });
// img.addEventListener('click', () => { controller.abort(); });

class Song {
    // The Instances model
    constructor() {
        this.artist = "json";
        this.album = "json";
        this.year = "json";
        this.fvSong = "json";

        this.cover = "fillData()";
        this.fvSongMedia = "fillData()";
        this.fvSongLyr = "fillData()";

        this.audio = false;
        this.lyrics = false;
        this.coverImg = false;
    }

    // The Instances Prototype model
    fillData() {
        // Fill up the missing data
        this.cover = `${this.artist}-${this.album}.jpg`
            .toLowerCase().replace(/\s/g, '.');
        this.fvSongMedia = `${this.artist}-${this.album}-${this.fvSong}.ogg`
            .toLowerCase().replace(/\s/g, '.');
        this.fvSongLyr = `${this.artist}-${this.album}-${this.fvSong}.txt`
            .toLowerCase().replace(/\s/g, '.');
    }

    async animateCover(init) {
        // Replace the previous cover
        if (init) {
            // If it is the init call: just replace the node
            nodes.cover.parentNode.replaceChild(this.coverImg, nodes.cover);
            nodes.cover = this.coverImg;

            // Return a promise to resolve the next step
            return new Promise(function (resolve, reject) {
                resolve('chain with the next promise');
            });
        } else {
            // If it is a regular call: animate the cover and replace the node
            return nodes.cover.animate(effectFadeOut, effectTiming).finished
                .then(animate => {
                    nodes.cover.parentNode.replaceChild(this.coverImg, nodes.cover);
                    nodes.cover = this.coverImg;

                    // Return a promise to resolve the next step
                    return nodes.cover.animate(effectFadeIn, effectTiming).finished;
                })
                .catch(error => { throw new Error(`Animate error: ${error}`); });
        }
    }

    replaceInfo() {
        nodes.artist.textContent = this.artist;
        nodes.album.textContent = this.album;
        nodes.song.textContent = this.fvSong;
        nodes.lyrics.textContent = this.lyrics;
    }

    replaceAudio() {
        nodes.player.src = this.audio;
        
        if (localStorage.getItem('autoPlay') === 'on') nodes.player.play();

        // Auto decrease the volume at the end of the song
        const fadeAudio = setInterval(() => {
            const fadePoint = nodes.player.duration - 6;

            if ((nodes.player.currentTime >= fadePoint) && (nodes.player.volume > 0)) {
                try {
                    nodes.player.volume -= 0.1;
                }
                catch (error) {
                    // console.log(`Volume fade error: ${error}`);
                    nodes.player.volume = 0;
                }
            }

            if (nodes.player.volume < 0.003) {
                nodes.player.volume = 0;
                clearInterval(fadeAudio);

                setTimeout(() => {
                    nodes.player.pause();
                    nodes.player.volume = 0.6;

                    // Call the next song, in auto play mode
                    if (localStorage.getItem('autoPlay') === 'on') Song.changeSong('next');
                }, 500);
            }
        }, 200);
    }

    // ... create promise function for fadeAudio...
    
    async deploy(init = false) {
        try {
            // Deal with the cover
            if (this.coverImg) {
                await this.animateCover(init);
            } else {
                const imgResponse = await fetch(`${dataUrl}/${this.cover}`);

                if (!imgResponse.ok)
                    throw new Error(`${this.cover} not found, response: ${imgResponse.status}`);

                const imgFile = await imgResponse.blob();
                this.coverImg = document.createElement('img');
                this.coverImg.src = URL.createObjectURL(imgFile);
                this.coverImg.classList.add('cover');
                this.coverImg.dataset.index = this.constructor.playList.indexOf(this);
                this.coverImg.addEventListener('click', showHideInfo);

                await this.animateCover(init);
            }

            // Deal with the lyrics
            if (this.lyrics) {
                this.replaceInfo();
            } else {
                const lyrResponse = await fetch(`${dataUrl}/${this.fvSongLyr}`);

                if (!lyrResponse.ok)
                    throw new Error(`${this.fvSongLyr} not found, response: ${lyrResponse.status}`);

                this.lyrics = await lyrResponse.text();
                this.replaceInfo();
            }

            // Deal with the audio
            if (this.audio) {
                this.replaceAudio();
            } else {
                const audioResponse = await fetch(`${dataUrl}/${this.fvSongMedia}`);

                if (!audioResponse.ok)
                    throw new Error(`${this.fvSongMedia} not found, response: ${audioResponse.status}`);

                const audioFile = await audioResponse.blob();
                this.audio = URL.createObjectURL(audioFile);
                this.replaceAudio();
            }
        } catch (error) {
            console.error(error);
        }
    }

    // The Class model
    static playList = [];

    static currentVolume = 0.8;

    static changeSong(direction) {
        const songs = this.playList;
        let currentSong = nodes.cover.dataset.index;

        if (direction === 'next') {
            if (currentSong < songs.length - 1) currentSong++;
            else currentSong = 0;
        } else if (direction === 'prev') {
            if (currentSong > 0) currentSong--;
            else currentSong = songs.length - 1;
        } else {
            console.error(`Invalid direction: ${direction}`);
        }

        songs[currentSong].deploy();
    }
}

// Show/Hide info - this function is used also within Song.deploy()
function showHideInfo(event) {
    const { output, btnShow } = nodes;

    // The default value is on
    if (localStorage.getItem('showInfo') === null) {
        localStorage.setItem('showInfo', 'on');
    }

    // On click change the value
    if (event && event.type === 'click') {
        if (localStorage.getItem('showInfo') === 'off') {
            localStorage.setItem('showInfo', 'on');
        } else if (localStorage.getItem('showInfo') === 'on') {
            localStorage.setItem('showInfo', 'off');
        } else {
            localStorage.setItem('showInfo', 'on');
        }
    }

    // Read the value and change the switch
    if (localStorage.getItem('showInfo') === 'off') {
        btnShow.innerText = 'Show info';
        output.style.display = 'none';
    } else if (localStorage.getItem('showInfo') === 'on') {
        btnShow.innerText = 'Hide info';
        output.style.display = 'table-caption';
    }
}
nodes.btnShow.addEventListener('click', showHideInfo);

// Autoplay switch
function autoplayOnOff(event) {
    const { autoplaySwitch, player } = nodes;

    // The default value is on
    if (localStorage.getItem('autoPlay') === null) {
        localStorage.setItem('autoPlay', 'on');
    }

    // On click change the value
    if (event && event.target === autoplaySwitch) {
        if (localStorage.getItem('autoPlay') === 'off') {
            localStorage.setItem('autoPlay', 'on');
        } else if (localStorage.getItem('autoPlay') === 'on') {
            localStorage.setItem('autoPlay', 'off');
        } else {
            localStorage.setItem('autoPlay', 'on');
        }
    }

    // Read the value and change the switch
    if (localStorage.getItem('autoPlay') === 'off') {
        autoplaySwitch.classList.replace('switch-on', 'switch-off');
    } else if (localStorage.getItem('autoPlay') === 'on') {
        autoplaySwitch.classList.replace('switch-off', 'switch-on');
    }
}
nodes.autoplaySwitch.addEventListener('click', autoplayOnOff);

// Lyrics switch
function lyricsOnOff(event) {
    const { lyricsSwitch, lyrics } = nodes;

    // The default value is off
    if (localStorage.getItem('lyricsSwitch') === null) {
        localStorage.setItem('lyricsSwitch', 'off');
    }

    // On click, change the value
    if (event && event.target === lyricsSwitch) {
        if (localStorage.getItem('lyricsSwitch') === 'off') {
            localStorage.setItem('lyricsSwitch', 'on');
        } else if (localStorage.getItem('lyricsSwitch') === 'on') {
            localStorage.setItem('lyricsSwitch', 'off');
        } else {
            localStorage.setItem('lyricsSwitch', 'off');
        }
    }

    // Read the value and show/hide the lyrics
    if (localStorage.getItem('lyricsSwitch') === 'off') {
        lyricsSwitch.classList.replace('switch-on', 'switch-off');
        lyrics.style.display = 'none';
    } else if (localStorage.getItem('lyricsSwitch') === 'on') {
        lyricsSwitch.classList.replace('switch-off', 'switch-on');
        lyrics.style.display = 'block';
    }
}
nodes.lyricsSwitch.addEventListener('click', lyricsOnOff);

// Get the sound collection collection 
async function getCollection(url) {
    try {
        const collection = await fetch(url);
        const data = await collection.json();
        const songs = data.map(entry => {
            const song = Object.assign(new Song(), entry);
            song.fillData();
            return song;
        });
        return songs;
    }
    catch (error) {
        console.log(`We have a problem: ${error}`);
    }
}

// The main logic
(async function init() {
    Song.playList = await getCollection(collectionUrl);

    const randomSongNumber = Math.floor(Math.random() * Song.playList.length);
    Song.playList[randomSongNumber].deploy(true);

    showHideInfo();
    autoplayOnOff();
    lyricsOnOff();

    nodes.btnRight.addEventListener('click', (e) => {
        Song.changeSong('next');
    });

    nodes.btnLeft.addEventListener('click', (e) => {
        Song.changeSong('prev');
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') Song.changeSong('next');
        if (e.key === 'ArrowLeft') Song.changeSong('prev');
    });

    // Do I need it?
    nodes.player.addEventListener('volumechange', (e) => {
        Song.currentVolume = Number(nodes.player.volume.toFixed(2));
    }, true);
})();
