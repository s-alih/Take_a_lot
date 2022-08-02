const { inputToConfig } = require("@ethereum-waffle/compiler")
const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle", () => {
          let VRFCoordinatorV2Mock, raffle, intervel

          beforEach(async () => {
              const { deployer } = await getNamedAccounts()
              await deployments.fixture(["all"])
              raffle = await ethers.getContract("Raffle", deployer)
              VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              intervel = await VRFCoordinatorV2Mock.getIntervel()
          })
          describe("constructor", async function () {
              it("initialise raffles correctly", async function () {
                  const raffleState = await raffle.getRaffleState()
                  assert.equal(raffleState.toString(), "0")
                  assert.equal(
                      intervel.toString(),
                      networkConfig[network.config.chainId]["intervel"]
                  )
              })
          })

          describe("enter raffle", async function () {
              it("revert when you are not paying enough", async function () {
                  await expect(raffle.enterRaffle()).to.be.revertedWith(
                      "Raffle__SendMoreToEnterRaffle"
                  )
              })
          })
      })
