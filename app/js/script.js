console.log("Javascript Starts");

let currentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;

  let a = await fetch(`http://127.0.0.1:3000/${currfolder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currfolder}/`)[1]);
    }
  }

  // Show All the Songs in the PlayList
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];

  songUL.innerHTML = "";

  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li><img class="invert" src="img/music.svg" alt="" />
            <div class="info">
              <div>${song.replaceAll("%20", " ")}</div>
              <div></div>
            </div>
            <div class="playnow">
              <span>Play Now</span>
              <img class="invert" src="img/play.svg" alt="" />
            </div></li>`;
  }

  // Attach an EventListener to Each Song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currfolder}/` + track;

  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function DisplayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];

      // Get the Metadata of the Folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
      <div class="play">
        <svg
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="black"
        >
          <path
            d="M5 20V4L19 12L5 20Z"
            stroke="#141B34"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <img
        src="/songs/${folder}/cover.jpg"
        alt=""
      />
      <h2>${response.title}</h2>
      <p>${response.description}</p>
    </div>`;
    }
  }

  // Load the Playlist whenever Card is Clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // Get the List of All Songs
  await getSongs("songs/ncs");

  playMusic(songs[0], true);

  // Display All the Albums on the Page
  DisplayAlbums();

  // Attach an EventListener to Play, Next and Previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeupdate Event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an EventListener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

    document.querySelector(".circle").style.left = percent + "%";

    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an EventListener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an EventListener for close Button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an EventListener to Previous Button
  previous.addEventListener("click", () => {
    console.log("Previous Clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an EventListener to Next Button
  next.addEventListener("click", () => {
    console.log("Next Clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an EventListener to Volume (Slider) Button
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting Volume to", e.target.value, "/ 100");

      currentSong.volume = parseInt(e.target.value) / 100;

      if (currentSong.volume > 0) {
        document.querySelector(".volume > img").src = document
          .querySelector(".volume > img")
          .src.replace("mute.svg", "volume.svg");
      }
    });

  // Add an EventListener to Mute the track
  document.querySelector(".volume > img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;

      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;

      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
