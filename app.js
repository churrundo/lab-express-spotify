require("dotenv").config();

const express = require("express");
const hbs = require("hbs");
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Our routes go here:
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/artist-search", (req, res) => {
  spotifyApi
    .searchArtists(req.query.artist)
    .then((data) => {
      console.log("The received data from the API: ", data.body);
      res.render("artist-search-results", { artists: data.body.artists.items });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});
app.get("/albums/:artistId", async (req, res) => {
  const artistId = req.params.artistId;

  const artistData = await spotifyApi.getArtist(artistId);
  const artistName = artistData.body.name;

  const albumData = await spotifyApi.getArtistAlbums(artistId);

  res.render("albums", {
    albums: albumData.body.items,
    artist: artistName,
  });
});

app.get("/albums/:albumId/tracks", async (req, res, next) => {
  try {
    const albumData = await spotifyApi.getAlbum(req.params.albumId);
    const album = albumData.body

    const data = await spotifyApi.getAlbumTracks(req.params.albumId);
    const tracks = data.body.items;

    res.render("tracks", { tracks, album });
  } catch (err) {
    console.error("Error occurred while fetching tracks:", err);
    next(err);
  }
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
