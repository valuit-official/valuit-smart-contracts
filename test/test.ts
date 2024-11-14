import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ClaimTopicsRegistry, ClaimTopicsRegistry__factory, CountryAllowModule, CountryAllowModule__factory, EquityConfig, EquityConfig__factory, FactoryProxy, FactoryProxy__factory, Fund, Fund__factory, FundFactory, FundFactory__factory, HoldTimeModule, HoldTimeModule__factory, Identity, Identity__factory, IdentityRegistry, IdentityRegistry__factory, IdentityRegistryStorage, IdentityRegistryStorage__factory, IdFactory, IdFactory__factory, ImplementationAuthority, ImplementationAuthority__factory, MaxBalanceModule, MaxBalanceModule__factory, ModularCompliance, ModularCompliance__factory, SupplyLimitModule, SupplyLimitModule__factory, Token, Token__factory, TREXFactory, TREXFactory__factory, TREXImplementationAuthority, TREXImplementationAuthority__factory, TrustedIssuersRegistry, TrustedIssuersRegistry__factory, USDC, USDC__factory, VERC20, VERC20__factory, Wrapper, Wrapper__factory } from "../typechain";

describe(" Tokenization Testing ", function () {
    let signer: SignerWithAddress;
    let signers: SignerWithAddress[];
    let owner: SignerWithAddress;
    let tokenIssuer: SignerWithAddress;
    let transferAgent: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let user3: SignerWithAddress;

    // const trustSigningKey = ethers.Wallet.createRandom();
  
    // console.log("claimIssuerSigningKey ", trustSigningKey);
  
    //Implementation
    let claimTopicsRegistryImplementation: ClaimTopicsRegistry;
    let trustedIssuersRegistryImplementation: TrustedIssuersRegistry;
    let identityRegistryStorageImplementation: IdentityRegistryStorage;
    let identityRegistryImplementation: IdentityRegistry;
    let modularComplianceImplementation: ModularCompliance;
    let tokenImplementation: Token;
    let trexFactory: TREXFactory;
    let trexImplementationAuthority: TREXImplementationAuthority;
    //Identity
    let identityImplementation: Identity;
    let identityImplementationAuthority: ImplementationAuthority;
    let identityFactory: IdFactory;
    //Compliance Modules
    let countryAllowCompliance: CountryAllowModule;
    let supplyLimitCompliance: SupplyLimitModule;
    let maxBalanceCompliance: MaxBalanceModule;
    let holdTimeCompliance: HoldTimeModule;
    //Fund Contract & EquityConfig Contract
    let fund: Fund;
    let fundFactory: FundFactory;
    let implFund: ImplementationAuthority;
    let fundProxy: FactoryProxy;
    let equityConfig: EquityConfig;
    let implEquityConfig: ImplementationAuthority;

    //Wrapper Contarct
    let wrapper: Wrapper;
    let verc20 : VERC20;

    //stable Coins
    let usdc: USDC;
  
    beforeEach(" ", async () => {
      signers = await ethers.getSigners();
      owner = signers[0];
      tokenIssuer = signers[1];
      transferAgent = signers[2];
      user1 = signers[4];
      user2 = signers[5];
      user3 = signers[6];
      
  
      // console.log("trust ", trust);
  
      //  let trustSigner =  provider.getSigner(trust.address)
  
      claimTopicsRegistryImplementation = await new ClaimTopicsRegistry__factory(owner).deploy();
  
      trustedIssuersRegistryImplementation = await new TrustedIssuersRegistry__factory(owner).deploy();

      identityRegistryStorageImplementation = await new IdentityRegistryStorage__factory(owner).deploy();

      identityRegistryImplementation = await new IdentityRegistry__factory(owner).deploy();

      modularComplianceImplementation = await new ModularCompliance__factory(owner).deploy();

      tokenImplementation = await new Token__factory(owner).deploy();
  
      trexImplementationAuthority =
        await new TREXImplementationAuthority__factory(owner).deploy(true, ethers.constants.AddressZero, ethers.constants.AddressZero);
  
      // ONCHAIN IDENTITY
      identityImplementation = await new Identity__factory(owner).deploy(owner.address,true);
  
      identityImplementationAuthority =
        await new ImplementationAuthority__factory(owner).deploy(identityImplementation.address);

        identityFactory = await new IdFactory__factory(owner).deploy(identityImplementationAuthority.address);
  
      const contractsStruct = {
        tokenImplementation: tokenImplementation.address,
        ctrImplementation: claimTopicsRegistryImplementation.address,
        irImplementation: identityRegistryImplementation.address,
        irsImplementation: identityRegistryStorageImplementation.address,
        tirImplementation: trustedIssuersRegistryImplementation.address,
        mcImplementation: modularComplianceImplementation.address,
      };
      const versionStruct = {
        major: 4,
        minor: 0,
        patch: 0,
      };
  
      await trexImplementationAuthority.connect(owner).addAndUseTREXVersion(versionStruct, contractsStruct);
  
      

    //   console.log("Factory Deployed", trexFactory.address);

      //Compliance Modules

    countryAllowCompliance = await new CountryAllowModule__factory(owner).deploy();
      
    supplyLimitCompliance = await new SupplyLimitModule__factory(owner).deploy();

    maxBalanceCompliance = await new MaxBalanceModule__factory(owner).deploy();

    holdTimeCompliance = await new HoldTimeModule__factory(owner).deploy();

    //Fund Contract

    fund = await new Fund__factory(owner).deploy();
    equityConfig = await new EquityConfig__factory(owner).deploy();
    implFund = await new ImplementationAuthority__factory(owner).deploy(fund.address);
    implEquityConfig = await new ImplementationAuthority__factory(owner).deploy(equityConfig.address);
    fundFactory = await new FundFactory__factory(owner).deploy();
    fundProxy = await new FactoryProxy__factory(owner).deploy();

    //Wrapper
    verc20 = await new VERC20__factory(owner).deploy();
    wrapper = await new Wrapper__factory(owner).deploy(verc20.address);

    //Stable Coin
    usdc = await new USDC__factory(owner).deploy();

    await usdc.mint(user1.address,1000000);

    await fundProxy.upgradeTo(fundFactory.address);

    trexFactory = await new TREXFactory__factory(owner).deploy(trexImplementationAuthority.address, identityFactory.address, wrapper.address);
    

    })
        it.only("Deploy Fund Contract", async () => {
            let tokenDetails = {
                owner: owner.address,
                name: "Nickel",
                symbol: "NKL",
                decimals: 18,
                irs: ethers.constants.AddressZero,
                ONCHAINID: ethers.constants.AddressZero,
                wrap:true,
                irAgents: [user1.address],
                tokenAgents: [user1.address],
                transferAgents:[],
                complianceModules: [countryAllowCompliance.address, 
                    supplyLimitCompliance.address, 
                    maxBalanceCompliance.address, 
                    holdTimeCompliance.address],
                complianceSettings: ["0x771c5281000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000005b",
                    "0x361fab2500000000000000000000000000000000000000000000000000000000000007d0", 
                    "0x9d51d9b700000000000000000000000000000000000000000000000000000000000000c8",
                    "0xf9455301000000000000000000000000000000000000000000000000000000006cd5fbcc"
                ]
            }
        
            let claimDetails = {
                claimTopics: [],
                issuers: [],
                issuerClaims: []
            };

            await identityFactory.addTokenFactory(trexFactory.address);

            const TX = await trexFactory.deployTREXSuite("process.env.TOKEN_SALT", tokenDetails, claimDetails);

            const receipt = await TX.wait();

            const event = receipt.events?.find(event=>event.event==="TREXSuiteDeployed");

            let token = event?.args; 

            // console.log("Token Address: ", token);
            let tokenAttached;
            let firstAddress;

            if (Array.isArray(token) && token.length > 0) {
                firstAddress = token[0];  // Directly accessing the first element
                // tokenAttached = await tokenImplementation.attach(firstAddress);
            }

            let fundProxyAttached = await fundFactory.attach(fundProxy.address);
            
            await fundProxyAttached.init(trexFactory.address);

            await fundProxyAttached.setImpl(implFund.address, implEquityConfig.address);
            // console.log("Fund Implementation Set");

            const tx = await fundProxyAttached.createFund(firstAddress, 
                "0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000076466353466726600000000000000000000000000000000000000000000000000",
                "Hello"
            );

            const receiptFund = await tx.wait();

            const event1 = receiptFund.events?.find(event=>event.event==="FundCreated");

            let fundContract = event1?.args; 

            let fundAddress;
            let fundAttached;

            if (Array.isArray(fundContract) && fundContract.length > 0) {
                fundAddress = fundContract[0];  // Directly accessing the first element
                fundAttached = await fund.attach(fundAddress);
            }

            expect (await fundAttached?.getNAV()).to.equal(5);

            await fundAttached?.connect(user1).setNAV(15);

            expect (await fundAttached?.getNAV()).to.equal(15);

            // console.log("fundContract Address: ", fundAddress, fundContract);

            // console.log("Fund Name:", await fundAttached?.fundName(), Number(await fundAttached?.cusip()), await fundAttached?.spvValuation(), await fundAttached?.yieldType());
            // console.log("Property Typr: ", Number( await fundAttached?.propertyType()),await fundAttached?.NAVLaunchPrice())
        })

        it("Factory", async () => {
            let tokenDetails = {
                owner: owner.address,
                name: "Nickel",
                symbol: "NKL",
                decimals: 18,
                irs: ethers.constants.AddressZero,
                ONCHAINID: ethers.constants.AddressZero,
                wrap:false,
                irAgents: [user1.address],
                tokenAgents: [user1.address],
                transferAgents:[],
                complianceModules: [countryAllowCompliance.address, 
                    supplyLimitCompliance.address, 
                    maxBalanceCompliance.address, 
                    holdTimeCompliance.address],
                complianceSettings: ["0x771c5281000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000005b",
                    "0x361fab2500000000000000000000000000000000000000000000000000000000000007d0", 
                    "0x9d51d9b700000000000000000000000000000000000000000000000000000000000000c8",
                    "0xf9455301000000000000000000000000000000000000000000000000000000006cd5fbcc"
                ]
            }
        
            let claimDetails = {
                claimTopics: [],
                issuers: [],
                issuerClaims: []
            };

            await identityFactory.addTokenFactory(trexFactory.address);

            const TX = await trexFactory.deployTREXSuite("process.env.TOKEN_SALT", tokenDetails, claimDetails);

            const receipt = await TX.wait();

            const event = receipt.events?.find(event=>event.event==="TREXSuiteDeployed");

            let token = event?.args; 

            // console.log("Token Address: ", token);
            let tokenAttached;
            let firstAddress;

            if (Array.isArray(token) && token.length > 0) {
                firstAddress = token[0];  // Directly accessing the first element
                tokenAttached = await tokenImplementation.attach(firstAddress);
            }

            expect(await tokenAttached?.name()).to.equal("Nickel");
            expect(await tokenAttached?.symbol()).to.equal("NKL");

            await identityFactory.createIdentity(user1.address, user1.address);
            await identityFactory.createIdentity(user2.address, user2.address);
            await identityFactory.createIdentity(user3.address, user3.address);

            let user1Identity = await identityFactory.getIdentity(user1.address);
            
            let identityRegistryAddress = await tokenAttached?.identityRegistry();

            
            let identityRegisteryAttached = identityRegistryImplementation.attach(String(identityRegistryAddress));
            await identityRegisteryAttached.connect(user1).registerIdentity(user1.address, String(user1Identity), 91);


            await tokenAttached?.connect(user1).mint(user1.address, 100);
            expect((await tokenAttached?.balanceOf(user1.address))).to.be.equal(100);

            expect((await trexFactory.getToken("process.env.TOKEN_SALT"))).to.equal(firstAddress);

            await trexFactory.setImplementationAuthority(trexImplementationAuthority.address);

            await trexFactory.setIdFactory(identityFactory.address);

            expect((await trexFactory.getIdFactory())).to.equal(identityFactory.address);

            expect((await trexFactory.getImplementationAuthority())).to.equal(trexImplementationAuthority.address);
        });

        it("Share Dividend", async () => {

            
            let tokenDetails = {
                owner: owner.address,
                name: "Nickel",
                symbol: "NKL",
                decimals: 18,
                irs: ethers.constants.AddressZero,
                ONCHAINID: ethers.constants.AddressZero,
                wrap:false,
                irAgents: [user1.address,fundProxy.address],
                tokenAgents: [user1.address],
                transferAgents:[],
                complianceModules: [countryAllowCompliance.address, 
                    supplyLimitCompliance.address, 
                    maxBalanceCompliance.address, 
                    holdTimeCompliance.address],
                complianceSettings: ["0x771c5281000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000005b",
                    "0x361fab2500000000000000000000000000000000000000000000000000000000000007d0", 
                    "0x9d51d9b700000000000000000000000000000000000000000000000000000000000000c8",
                    "0xf9455301000000000000000000000000000000000000000000000000000000006cd5fbcc"
                ]
            }
        
            let claimDetails = {
                claimTopics: [],
                issuers: [],
                issuerClaims: []
            };

            await identityFactory.addTokenFactory(trexFactory.address);

            const TX = await trexFactory.deployTREXSuite("process.env.TOKEN_SALT", tokenDetails, claimDetails);

            const receipt = await TX.wait();

            const event = receipt.events?.find(event=>event.event==="TREXSuiteDeployed");

            let token = event?.args; 

            // console.log("Token Address: ", token);
            let tokenAttached;
            let firstAddress;

            if (Array.isArray(token) && token.length > 0) {
                firstAddress = token[0];  // Directly accessing the first element
                tokenAttached = await tokenImplementation.attach(firstAddress);
            }


            await identityFactory.createIdentity(user1.address, user1.address);
            await identityFactory.createIdentity(user2.address, user2.address);
            await identityFactory.createIdentity(user3.address, user3.address);

            let user1Identity = await identityFactory.getIdentity(user1.address);
            let user2Identity = await identityFactory.getIdentity(user2.address);
            let user3Identity = await identityFactory.getIdentity(user3.address); 
            

            let fundProxyAttached = await fundFactory.attach(fundProxy.address);
            
            await fundProxyAttached.init(trexFactory.address);

            await fundProxyAttached.setImpl(implFund.address, implEquityConfig.address);
            // console.log("Fund Implementation Set");

            const tx = await fundProxyAttached.createFund(firstAddress, 
                "0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000076466353466726600000000000000000000000000000000000000000000000000",
                "Hello"
            );

            const receiptFund = await tx.wait();

            const event1 = receiptFund.events?.find(event=>event.event==="FundCreated");

            let fundContract = event1?.args; 

            let fundAddress;
            let fundAttached;

            if (Array.isArray(fundContract) && fundContract.length > 0) {
                fundAddress = fundContract[0];  // Directly accessing the first element
                fundAttached = await fund.attach(fundAddress);
            }

            await fundProxyAttached.connect(user1).batchWhitelist(firstAddress,[user1.address,user2.address,user3.address],[user1Identity,user2Identity,user3Identity],[91,91,91],["a","b","c"]);

            await usdc.connect(user1).approve(fundAddress,1000);

            await fundAttached?.connect(user1).shareDividend([user2.address,owner.address], [50,50], usdc.address);


        })


        it("Deploy Equity Config Contract", async () => {
            let tokenDetails = {
                owner: owner.address,
                name: "Nickel",
                symbol: "NKL",
                decimals: 18,
                irs: ethers.constants.AddressZero,
                ONCHAINID: ethers.constants.AddressZero,
                wrap:false,
                irAgents: [user1.address],
                tokenAgents: [user1.address],
                transferAgents:[],
                complianceModules: [countryAllowCompliance.address, 
                    supplyLimitCompliance.address, 
                    maxBalanceCompliance.address, 
                    holdTimeCompliance.address],
                complianceSettings: ["0x771c5281000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000005b",
                    "0x361fab2500000000000000000000000000000000000000000000000000000000000007d0", 
                    "0x9d51d9b700000000000000000000000000000000000000000000000000000000000000c8",
                    "0xf9455301000000000000000000000000000000000000000000000000000000006cd5fbcc"
                ]
            }
        
            let claimDetails = {
                claimTopics: [],
                issuers: [],
                issuerClaims: []
            };

            await identityFactory.addTokenFactory(trexFactory.address);

            const TX = await trexFactory.deployTREXSuite("process.env.TOKEN_SALT", tokenDetails, claimDetails);

            const receipt = await TX.wait();

            const event = receipt.events?.find(event=>event.event==="TREXSuiteDeployed");

            let token = event?.args; 

            // console.log("Token Address: ", token);
            let tokenAttached;
            let firstAddress;

            if (Array.isArray(token) && token.length > 0) {
                firstAddress = token[0];  // Directly accessing the first element
                // tokenAttached = await tokenImplementation.attach(firstAddress);
            }

            await fundProxy.setMaintenance(true);
            await fundProxy.setMaintenance(false);

            let fundProxyAttached = await fundFactory.attach(fundProxy.address);
            
            await fundProxyAttached.init(trexFactory.address);

            await fundProxyAttached.setImpl(implFund.address, implEquityConfig.address);

            const tx = await fundProxyAttached.createEquityConfig(firstAddress,"0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000537342e3938000000000000000000000000000000000000000000000000000000", "EquityConfig");
        
            const receiptFund = await tx.wait();

            const event1 = receiptFund.events?.find(event=>event.event==="EquityConfigCreated");

            let equityConfigContract = event1?.args; 

            let equityConfigAddress;
            let equityConfigAttached;

            if (Array.isArray(equityConfigContract) && equityConfigContract.length > 0) {
                equityConfigAddress = equityConfigContract[0];  // Directly accessing the first element
                equityConfigAttached = await equityConfig.attach(equityConfigAddress);
            }

            await equityConfigAttached?.connect(user1).setValuation(100);


        })

        


  });


