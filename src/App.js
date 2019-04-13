import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

//===================================================================================
import { MetamaskProvider } from "@0xcert/ethereum-metamask-provider";
import { schema88 } from "@0xcert/conventions";
import { Cert } from "@0xcert/cert";
import {
  AssetLedger,
  AssetLedgerCapability
} from "@0xcert/ethereum-asset-ledger";
// Assets Ledgers are groups of tokens that are managed by certain users just like mods in a chat to do what's required
// The Capabilities determine what those mods can do with the assets they are managing
// The Ethereum address that deploys this ledger has full powers to do whatever he wants as the administrator

const path = require("path");
const fs = require("fs");

// To configure new ERC721 assets
async function displayBlueprint() {
  const cert = new Cert({
    schema: schema88
  });

  const asset = {
    name: "Unsplash",
    description: "Photo by Madison Olling on Unsplash",
    image: fs.readFileSync(
      path.join(__dirname, "./images/madison-olling-unsplash.jpg")
    ),
    edition: 1,
    totalCount: 5
  };

  // The imprint is the hashed proof for our asset
  console.log("Imprint", await cert.imprint(asset));
  console.log("Expose", await cert.expose(asset, [["name"], ["image"]]));
}

class App extends Component {
  render() {
    return (
      <div>
        <h1>ERC721 Art Marketplace</h1>
        <p>
          In this marketplace you can deploy unique ERC721 art pieces to the
          blockchain with 0xcert.
        </p>
        <div className="assets-container" />
        <button className="margin-right">Deploy Art Piece</button>
        <button>Get Art Pieces</button>
      </div>
    );
  }
}

export default App;
