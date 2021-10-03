//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2; // required to accept structs as function parameters

import "./utils.sol";

contract GhoulieNFT is ERC721URIStorage, EIP712, AccessControl, Ownable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    string private constant SIGNING_DOMAIN = "LazyNFT-Voucher";
    string private constant SIGNATURE_VERSION = "1";

    // Map for storing URIs of NFTs
    mapping(uint256 => string) private _tokenURIs;

    // Maximum number of Ghoulies that can be minted ever
    uint256 public MAX_RANGE = 10001;

    // Maximum number of Ghoulies that can be redeemed by public
    uint256 public MAX_PUBLIC_RANGE = 9902; // 9900 + 2 special ghoulies

    // Presale start and end indicator
    bool private _presale = true; // true for 24 hours

    // Base URI of Ghoulie NFTs
    string private _CbaseURI;

    // All presale redeemed Ghoulies will have a single CID
    string private _presaleCID;

    // Maximum number of Ghoulies that can be sold in presale
    uint256 public presaleLimit = 2000;

    // Maximum number of Ghoulies that can be redeemed by a single address in presale
    uint256 public presaleRedemptionLimit = 5;

    // Maximum number of Ghoulies that can be redeemed by a single address ever
    uint256 public redemptionLimit = 25;

    string private _coffinURI;

    bool private _extPresale = true; //true for 24 hours + 2 hours

    // Presale counter
    uint256 private _presaleRange;

    // State variable for storing the latest minted toke id
    uint256 public currentTokenID;

    // withdrawal address were all the funds will be debited
    address payable withdrawalAddress =
        payable(0x55463096D572D6D89554603B8366561ADa382159);

    mapping(address => uint256) pendingWithdrawals;

    constructor(address payable minter)
        ERC721("GoulieNFT", "GOLE")
        EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION)
    {
        _setupRole(MINTER_ROLE, minter);
        _CbaseURI = "https://ipfs.io/ipfs/";
        _coffinURI = "bafkreifzyndzi52omxpdfxegd23csnxswqtwixf4y4hw5rcemo7fskkrwu";
        _presaleRange = 0;
        currentTokenID = 0;

        // mint 3 special ghoulies
        ownerMint(
            7479,
            "bafkreigp4vba4wffnyvcjfe5ts5novumnih55s476fzknevqsm6r4uutoi"
        );
        ownerMint(
            9811,
            "bafkreiadmljofpfannzkksik3i6v35pu63tc2kkphg3gjjz7fk4y52v5au"
        );
        ownerMint(
            10001,
            "bafkreihqy5b2kf4uphndsckmcpefzy426pvmao6yuborzuuiswrcfig3ey"
        );
    }

    /// @notice Represents an un-minted NFT, which has not yet been recorded into the blockchain. A signed voucher can be redeemed for a real NFT using the redeem function.
    struct NFTVoucher {
        /// @notice The id of the token to be redeemed. Must be unique - if another token with this ID already exists, the redeem function will revert.
        bool presale;
        /// @notice The minimum price (in wei) that the NFT creator is willing to accept for the initial sale of this NFT.
        uint256 minPrice;
        /// @notice The metadata URI to associate with this token.
        string cid;
        /// @notice the EIP-712 signature of all other fields in the NFTVoucher struct. For a voucher to be valid, it must be signed by an account with the MINTER_ROLE.
        bytes signature;
    }

    function baseURI() public view returns (string memory) {
        return _CbaseURI;
    }

    function presaleStatus() public view returns (bool) {
        return _presale;
    }

    function presaleCID() public view returns (string memory) {
        return _presaleCID;
    }

    function presaleRange() public view returns (uint256) {
        return _presaleRange;
    }

    function extPresaleStatus() public view returns (bool) {
        return _extPresale;
    }

    function switchPresale() public onlyOwner {
        require(presaleStatus(), "Presale has already ended");
        _presale = false;
    }

    function switchExtPresale() public onlyOwner {
        require(!presaleStatus(), "Presale has not ended yet");
        require(
            bytes(presaleCID()).length > 0,
            "Presale CID has not been set yet"
        );
        require(extPresaleStatus(), "Extended presale has already ended");
        _extPresale = false;
    }

    function setMaxPublicRange(uint256 _maxRange) public onlyOwner {
        require(
            _maxRange <= MAX_RANGE,
            "Max_PUBLIC_RANGE cannot exceed MAX_RANGE"
        );
        MAX_PUBLIC_RANGE = _maxRange;
    }

    function setMaxRange(uint256 _maxRange) public onlyOwner {
        MAX_RANGE = _maxRange;
    }

    function setBaseURI(string memory uri) public onlyOwner {
        _CbaseURI = uri;
    }

    function setPresaleCID(string memory newPresaleCID) public onlyOwner {
        require(
            !presaleStatus(),
            "Cannot set the presale CID during the presale"
        );
        _presaleCID = newPresaleCID;
    }

    function setPresaleLimit(uint256 _presaleLimit) public onlyOwner {
        require(presaleStatus(), "Presale has already ended");
        presaleLimit = _presaleLimit;
    }

    function setPresaleRedemptionLimit(uint256 _limit) public onlyOwner {
        require(presaleStatus(), "Presale has ended");
        presaleRedemptionLimit = _limit;
    }

    function setRedemptionLimit(uint256 _limit) public onlyOwner {
        require(
            _limit <= MAX_PUBLIC_RANGE,
            "Redemption limit cannot be more than MAX_PUBLIC_RANGE"
        );
        redemptionLimit = _limit;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(tokenId), "Query for non existent token");
        if (presaleStatus()) {
            return string(abi.encodePacked(baseURI(), _coffinURI));
        } else if (extPresaleStatus() && tokenId <= presaleRange()) {
            return string(abi.encodePacked(baseURI(), _coffinURI));
        } else if (tokenId <= presaleRange()) {
            string memory uri = string(
                abi.encodePacked(
                    baseURI(),
                    presaleCID(),
                    "/",
                    Strings.toString(tokenId),
                    ".json"
                )
            );
            return uri;
        } else {
            return string(abi.encodePacked(baseURI(), _tokenURIs[tokenId]));
        }
    }

    // Special function for setting the URI of special ghoulies
    // @notice This is critical function, should be used carefully
    function ownerSetURI(uint256 tokenId, string memory uri) public onlyOwner {
        require(
            tokenId > presaleRange(),
            "Uri cannot be set for Presale tokens"
        );
        require(tokenId <= MAX_RANGE, "Token id out of MAX_RANGE");
        require(_exists(tokenId), "Cannot set the uri for non-existent token");
        _tokenURIs[tokenId] = uri;
    }

    // special function for minting special ghoulies
    // CRITICAL: Only Owner can call this to prevent any hazard
    function ownerMint(uint256 tokenId, string memory cid) public onlyOwner {
        require(
            tokenId <= MAX_RANGE,
            "Max range for minting the NFTs has been reached"
        );
        require(
            tokenId > MAX_PUBLIC_RANGE || tokenId == 7479 || tokenId == 9811,
            "Owner minting is only allowed above MAX_PUBLIC_RANGE"
        );
        _mint(withdrawalAddress, tokenId);
        _tokenURIs[tokenId] = cid;
    }

    // special function for minting special ghoulies
    // CRITICAL: Only Owner can call this to prevent any hazard
    function ownerBatchMint(uint256[] memory ids, string[] memory cids)
        public
        onlyOwner
    {
        require(
            ids.length == cids.length,
            "ids length does not match cids length"
        );
        for (uint256 i = 0; i < ids.length; i++) {
            ownerMint(ids[i], cids[i]);
        }
    }

    /// @notice allows the user to redeem NFTs in batch
    /// payments and funds are handled here
    /// Wrapper for _redeem
    function redeem(
        uint256 tokenCount,
        address redeemer,
        NFTVoucher[] calldata vouchers
    ) public payable {
        require(redeemer != address(0), "Null address not allowed");
        require(
            tokenCount == vouchers.length,
            "token count and Vouchers length do not match"
        );

        uint256 balance = balanceOf(_msgSender());
        if (presaleStatus()) {
            require(
                balance + tokenCount <= presaleRedemptionLimit,
                string(
                    abi.encodePacked(
                        "Redeemer can only redeem ",
                        Strings.toString(presaleRedemptionLimit - balance),
                        " more tokens in presale"
                    )
                )
            );
        } else {
            require(
                balance + tokenCount <= redemptionLimit,
                string(
                    abi.encodePacked(
                        "Redeemer can only redeem ",
                        Strings.toString(redemptionLimit - balance),
                        " more tokens"
                    )
                )
            );
        }

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < tokenCount; i++) {
            _redeem(redeemer, vouchers[i]);
            totalAmount = totalAmount + vouchers[i].minPrice;
        }

        // check if the total vlaue sent is enough to cover the min prices of all the tokens
        require(
            msg.value >= totalAmount,
            "Insufficient funds for the transaction"
        );
        pendingWithdrawals[withdrawalAddress] += msg.value;
    }

    /// @notice Transfers all pending withdrawal balance to the caller. Reverts if the caller is not an authorized minter.
    function withdraw() public {
        require(_msgSender() == withdrawalAddress, "Unauthorized withdrawal");

        // IMPORTANT: casting msg.sender to a payable address is only safe if ALL members of the minter role are payable addresses.
        address payable receiver = withdrawalAddress;

        uint256 amount = pendingWithdrawals[receiver];
        // zero account before transfer to prevent re-entrancy attack
        pendingWithdrawals[receiver] = 0;
        receiver.transfer(amount);
    }

    /// @notice Retuns the amount of Ether available to the caller to withdraw.
    function availableToWithdraw() public view returns (uint256) {
        return pendingWithdrawals[msg.sender];
    }

    // Sets the URIs for all the Ghoulies
    function _setURI(uint256 tokenId, string memory cid) internal virtual {
        require(
            _exists(tokenId),
            "Setting URI for non-existent token not allowed"
        );
        require(
            bytes(_tokenURIs[tokenId]).length == 0,
            "This token's URI already exists"
        );
        if (!presaleStatus() || tokenId > presaleRange()) {
            _tokenURIs[tokenId] = cid;
        }
    }

    /// @notice Redeems an NFTVoucher for an actual NFT, creating it in the process.
    /// @param redeemer The address of the account which will receive the NFT upon success.
    /// @param voucher A signed NFTVoucher that describes the NFT to be redeemed.
    function _redeem(address redeemer, NFTVoucher calldata voucher)
        internal
        virtual
    {
        // Check if the complete range is sold
        require(
            getNextTokenID() <= MAX_PUBLIC_RANGE,
            "Complete range sold out"
        );

        // make sure signature is valid and get the address of the signer
        address signer = _verify(voucher);

        // make sure that the signer is authorized to mint NFTs
        require(
            hasRole(MINTER_ROLE, signer),
            "Signature invalid or unauthorized"
        );

        // first assign the token to the signer, to establish provenance on-chain
        if (getNextTokenID() > presaleLimit) {
            require(
                !presaleStatus(),
                "Presale sold out, You cannot buy until the presale ends"
            );
        }

        // check if the presale is over and the function is recieving voucher.presale == true
        if (!presaleStatus()) {
            require(!voucher.presale, "Voucher is invalid: Presale has ended");
        }

        uint256 tokenId = getNextTokenID();

        _incrementTokenTypeId();
        if (presaleStatus()) {
            _incrementPresaleRange();
        }
        _mint(signer, tokenId);
        _setURI(tokenId, voucher.cid);

        // transfer the token to the redeemer
        _transfer(signer, redeemer, tokenId);
    }

    /// @notice Returns a hash of the given NFTVoucher, prepared using EIP712 typed data hashing rules.
    /// @param voucher An NFTVoucher to hash.
    function _hash(NFTVoucher calldata voucher)
        internal
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "NFTVoucher(bool presale,uint256 minPrice,string cid)"
                        ),
                        voucher.presale,
                        voucher.minPrice,
                        keccak256(bytes(voucher.cid))
                    )
                )
            );
    }

    /// @notice Returns the chain id of the current blockchain.
    /// @dev This is used to workaround an issue with ganache returning different values from the on-chain chainid() function and
    ///  the eth_chainId RPC method. See https://github.com/protocol/nft-website/issues/121 for context.
    function getChainID() external view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }

    /// @notice Verifies the signature for a given NFTVoucher, returning the address of the signer.
    /// @dev Will revert if the signature is invalid. Does not verify that the signer is authorized to mint NFTs.
    /// @param voucher An NFTVoucher describing an unminted NFT.
    function _verify(NFTVoucher calldata voucher)
        internal
        view
        returns (address)
    {
        bytes32 digest = _hash(voucher);
        return ECDSA.recover(digest, voucher.signature);
    }

    function getNextTokenID() public view returns (uint256) {
        if (_exists(currentTokenID + 1)) {
            return currentTokenID + 2;
        }
        return currentTokenID + 1;
    }

    /**
     * @dev increments the value of _currentTokenID
     */
    function _incrementTokenTypeId() private {
        require(
            currentTokenID <= MAX_PUBLIC_RANGE,
            "Max range has been reached"
        );
        if (_exists(currentTokenID + 1)) {
            currentTokenID += 2;
        } else {
            currentTokenID++;
        }
    }

    function _incrementPresaleRange() private {
        require(presaleRange() <= presaleLimit, "Presale sold out");
        if (_exists(currentTokenID + 1)) {
            _presaleRange += 2;
        } else {
            _presaleRange++;
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC721)
        returns (bool)
    {
        return
            ERC721.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }

    function contractURI() public pure returns (string memory) {
        return
            "https://gateway.pinata.cloud/ipfs/QmXNv9ApVynHdT72XQnBmD87MU2HWyEvyJyqcvWjd9Z9Jo";
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}
