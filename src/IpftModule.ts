import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { bootstrap } from '@libp2p/bootstrap';
import { identify, identifyPush } from '@libp2p/identify';
import { kadDHT, removePrivateAddressesMapper, removePublicAddressesMapper } from '@libp2p/kad-dht';
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery';
import { IModule, ITranslation, ITranslationsSymbol } from '@undyingwraith/jaaf-core';
import { ping } from '@libp2p/ping';
import { FileTransferService, FileTransferServiceSymbol, FriendsService, IFriendsService, IFriendsServiceSymbol, ILibp2pConfig, ILibp2pConfigSymbol, ILibp2pServiceSymbol, Libp2pService } from './Services';
import translations from './translations';

export const IpftModule: IModule = async (app) => {
	app.registerConstantMultiple<ITranslation>(translations, ITranslationsSymbol);

	await app.register<IFriendsService>(FriendsService, IFriendsServiceSymbol);
	await app.register(FileTransferService, FileTransferServiceSymbol);
	await app.register(Libp2pService, ILibp2pServiceSymbol);
	await app.registerConstant<ILibp2pConfig>({
		peerDiscovery: [
			bootstrap({
				list: [
					'/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
					'/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
					'/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
					'/dnsaddr/va1.bootstrap.libp2p.io/p2p/12D3KooWKnDdG3iXw9eTFijk3EWSunZcFi54Zka4wmtqtt6rPxc8',
					'/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
				],
			}),
			pubsubPeerDiscovery(),
		],
		services: {
			lanDHT: kadDHT({
				protocol: '/ipfs/lan/kad/1.0.0',
				peerInfoMapper: removePublicAddressesMapper,
				clientMode: false,
				logPrefix: 'libp2p:dht-lan',
				datastorePrefix: '/dht-lan',
				metricsPrefix: 'libp2p_dht_lan'
			}),
			aminoDHT: kadDHT({
				protocol: '/ipfs/kad/1.0.0',
				peerInfoMapper: removePrivateAddressesMapper,
				logPrefix: 'libp2p:dht-amino',
				datastorePrefix: '/dht-amino',
				metricsPrefix: 'libp2p_dht_amino'
			}),
			identify: identify(),
			identifyPush: identifyPush(),
			ping: ping(),
			pubsub: gossipsub({
				allowPublishToZeroTopicPeers: true,
				canRelayMessage: true,
			}),
		},
	}, ILibp2pConfigSymbol);
	app.registerStartupAction((app) => app.getService<Libp2pService>(ILibp2pServiceSymbol).start());
};
