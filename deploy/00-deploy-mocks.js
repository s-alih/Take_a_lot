const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments
    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentChains.includes(network.name)) {
        log("local network detected: deploying Mock")

        const mock = await deploy("VRFCoordinatorV2Mocks", {
            log: true,
            from: deployer,
            args: args,
        })

        console.log("MOCKS DEPLOYED")
    }
}
