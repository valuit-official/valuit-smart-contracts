// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import 'contracts/fund/IFund.sol';
import "contracts/fund/FundStorage.sol";
import "contracts/factory/ITREXFactory.sol";
import 'contracts/fund/ITKN.sol';
import 'contracts/escrow/TransferHelper.sol';
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";


contract Fund is IFund, Initializable, FundStorage, OwnableUpgradeable {

    function init(address _token, bytes memory _data) external initializer{
        _transferOwnership(msg.sender);
        factory = address(msg.sender);

        token = _token;
        fundName = IToken(_token).name();

        (propertyType, 
        NAVLaunchPrice,
        cusip,
        yieldType,
        spvValuation) = abi.decode(_data, (uint256, uint256, uint256, uint256, uint256));
    }

    function getNAV() external returns (uint256){
        return NAVLatestPrice;
    }

    function getAUM() external returns (uint256){
        ITKN mytoken = ITKN(token);
        uint256 totalSupply = mytoken.totalSupply();
        AssetUnderManagement = totalSupply * NAVLatestPrice;
        return AssetUnderManagement;
    }

    function setNAV(uint256 _latestNAV) external returns(bool){
        require(ITKN(token).isAgent(msg.sender), "Only Token Agent can call");
        NAVLatestPrice = _latestNAV;
        return true;
    }

    function shareDividend(address[] calldata _address, 
                            uint256[] calldata _dividend,  
                            address stableCoin_) public {
        require(_address.length == _dividend.length, "Invalid Input");
        require(ITKN(token).isAgent(msg.sender), "Only Token Agent can call");

        for(uint i=0; i<_address.length; i++){
            TransferHelper.safeTransferFrom(stableCoin_, msg.sender, _address[i], _dividend[i]);
        }
    }
}
