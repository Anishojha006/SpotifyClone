console.log("Lets write javascript");
let currentSong = new Audio();
let songs;
let currfolder;

function formatSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`${folder}`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // show all the songs in the playlist 
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML += `<li><img class="invert" width="34" src="img/music.svg" alt=" "></img>
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div> Anish Ojha </div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="img/playbutton.svg" alt=""></img>
        </div>
    </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/songs/")[1].split("/")[0];  // ✅ FIXED PATH

            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
       

            cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="${folder}" class="card ">
                        <div    class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision"
                                text-rendering="geometricPrecision" image-rendering="optimizeQuality"
                                fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 512">
                                <circle fill="green" cx="256" cy="256" r="256" />
                                <path fill="black"
                                    d="M351.74 275.46c17.09-11.03 17.04-23.32 0-33.09l-133.52-97.7c-13.92-8.73-28.44-3.6-28.05 14.57l.54 191.94c1.2 19.71 12.44 25.12 29.04 16l131.99-91.72z" />
                            </svg>


                        </div>

                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }

    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
           
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        });
    });
}

async function main() {
    await getsongs("songs/ncs");
    playMusic(songs[0], true);
    displayAlbums();  // ✅ Fixed function name

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/playbutton.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatSecondsToMinutes(currentSong.currentTime)}/${formatSecondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
           
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        currentSong.pause();
   
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

  // Add event listener to mute the track
  document.querySelector(".volume >img ").addEventListener("click",e=>{
    console.log(e.target);
    if(e.target.src.includes("img/volume.svg")){
        e.target.src =e.target.src.replace(img/"volume.svg","img/mute.svg")
        currentSong.volume=0;
        document.querySelector(".range").getElementsByTagName("input")[0].value=0;
    }
    else{
        e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg")
        currentSong.volume= 1;
        document.querySelector(".range").getElementsByTagName("input")[0].value= 10;
    }
  })

}

main();