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
const Web3 = require("web3");
const path = require("path");
const fs = require("fs");

class App extends Component {
  constructor() {
    super();

    this.state = {
      provider: {},
      ledger: {},
      assets: []
    };
  }

  async componentDidMount() {
    await this.setProvider();
    await this.displayBlueprint();
    const newLedger = await this.deployNewLedger();
    await this.setExistingLedger(newLedger); //newLedger will likely be a string of address for deployedLedger
    await this.setAssetArray();
    // await this.getUserBalance();
    // await this.deployArtAsset()
  }

  // To set a metamask provider
  async setProvider() {
    const provider = new MetamaskProvider();
    if (!(await provider.isEnabled())) {
      await provider.enable();
    }
    await this.setState({ provider });
  }

  //To set the ledger as a state object
  async setExistingLedger(newLedger) {
    const ledgerAddress = newLedger;
    const ledger = AssetLedger.getInstance(this.state.provider, ledgerAddress); //instantiate an existing ledger
    await this.setState({ ledger }); //setting state for react instance
  }

  //To get user ERC721 token balance - counter of how many assets a user owns
  async getUserBalance() {
    const web3 = new Web3(this.state.provider);
    const balance = await this.state.ledger.getBalance(web3.eth.accounts[0]);
    return balance;
  }

  // Generate an array for each asset to create the corresponding Artcryption-NFT (name in recipe) components
  async setAssetArray() {
    const assets = await this.getUserBalance(); //user’s balance which is just the counter of how many assets you own
    let assetArray = [];

    // Generate an array for each asset
    for (let i = 0; i < assets; i++) {
      assetArray.push(i);
    }
    assetArray = assetArray.map(i => <ArtPiece assetId={i} key={i} />);
    console.log("Assets", assetArray);
    await this.setState({ assets: assetArray });
  }

  // To configure new ERC721 assets - THIS WILL CREATE A HASH - represented by imprint
  async displayBlueprint() {
    const cert = new Cert({
      schema: schema88
    });

    const asset = {
      name: "Unsplash",
      description: "Photo by Madison Olling on Unsplash",
      image: "./images/madison-olling-unsplash.jpg",
      url: "https://unsplash.com/photos/nUrfdD3GQLU",
      edition: 1,
      totalCount: 5
    };

    // The imprint is the hashed proof for our asset
    console.log("Imprint", await cert.imprint(asset));
    console.log(
      "Expose",
      await cert.expose(asset, [["name"], ["image"], ["url"]])
    );
  }

  // To create a new asset ledger containing several assets and managed by several individuals
  // The asset ledger is mandatory to create new assets since they need a place to be stored, they can't exist without a ledger
  async deployNewLedger() {
    let deployedLedger = {};

    // The required keys are name, symbol, uriBase and schemaId
    const recipe = {
      name: "Artcryption-NFT",
      symbol: "ART",
      uriBase: "www.example.com/tokenMetadata/", // setup a server for generating tokens to this URI
      schemaId:
        "0xa4cf0407b223849773430feaf0949827373c40feb3258d82dd605ed41c5e9a2c", // This is the ID from schema88 available at https://github.com/0xcert/framework/blob/master/conventions/88-crypto-collectible-schema.md
      //SchemaID is required for deploying asset ledger. It is one of the conventions used by 0xcert to allow dApp to communicate with other dApps using same standard. Schema 88 defines information about crypto-collectibles so that we can use ERC721 tokens from other applications as well.
      capabilities: [
        AssetLedgerCapability.DESTROY_ASSET,
        AssetLedgerCapability.UPDATE_ASSET,
        AssetLedgerCapability.TOGGLE_TRANSFERS,
        AssetLedgerCapability.REVOKE_ASSET
      ]
    };

    try {
      deployedLedger = await AssetLedger.deploy(
        this.state.provider,
        recipe
      ).then(mutation => {
        console.log("Deploying new asset ledger, it may take a few minutes.");
        return mutation.complete();
      });
      console.log("Ledger: ", deployedLedger);
    } catch (e) {
      console.log("Error: ", e);
    }

    if (deployedLedger.isCompleted()) {
      console.log("Ledger address: ", deployedLedger.receiverId);
    }
  }

  render() {
    return (
      <div>
        <h1>ERC721 Art Marketplace</h1>
        <p>
          In this marketplace you can deploy unique ERC721 art pieces to the
          blockchain with 0xcert.
        </p>
        <div className="assets-container">{this.state.assets}</div>
        <button
          className="margin-right"
          onClick={() => {
            this.deployArtAsset();
          }}
        >
          Deploy Art Piece
        </button>
        <button
          onClick={() => {
            this.getArtAssets();
          }}
        >
          Get Art Pieces
        </button>
      </div>
    );
  }
}

class ArtPiece extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className="art-container">
        <img
          className="art-image"
          src="https://unsplash.com/photos/nUrfdD3GQLU"
          width="300px"
        />
        <div className="art-id">{this.props.assetId}</div>
        <div className="art-owner">{web3.eth.accounts[0]}</div>
      </div>
    );
  }
}

export default App;
