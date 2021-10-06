const { LazyMinter } = require('../lib')
const ethers = require('ethers');

async function main() {

    const itx = new ethers.providers.InfuraProvider(
        'rinkeby',
        '63ded85a9a5442c6ae2b94c2e97fb8c4'
    )
    const minter = new ethers.Wallet('abd445f0700f2f164bcce0a54da23037b06f83c4e1838cf91b2d7453651fe75d', itx)

    const contractAddress = "0x2570f12074Ac007aEc09426C5D092Dd2a1Fa3E5F";

    const lazyMinter = new LazyMinter({ contractAddress: contractAddress, signer: minter })
    const minPrice = ethers.utils.parseEther("0.0666");

    let voucher = await lazyMinter.createVoucher(true, "ok", minPrice)

    console.log(voucher)

}

main()

