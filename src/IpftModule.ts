import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { bootstrap } from '@libp2p/bootstrap';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import { identify, identifyPush } from '@libp2p/identify';
import { kadDHT, removePrivateAddressesMapper, removePublicAddressesMapper } from '@libp2p/kad-dht';
import { ping } from '@libp2p/ping';
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery';
import { webRTC, webRTCDirect } from '@libp2p/webrtc';
import { webSockets } from '@libp2p/websockets';
import { webTransport } from '@libp2p/webtransport';
import { IModule, ITranslation, ITranslationsSymbol } from '@undyingwraith/jaaf-core';
import { IDBDatastore } from 'datastore-idb';
import { FileTransferService, FileTransferServiceSymbol, FriendsService, IDatastoreSymbol, IFriendsService, IFriendsServiceSymbol, ILibp2pConfig, ILibp2pConfigSymbol, ILibp2pServiceSymbol, Libp2pService } from './Services';
import translations from './translations';

export const IpftModule: IModule = async (app) => {
	app.registerConstantMultiple<ITranslation>(translations, ITranslationsSymbol);

	await app.register<IFriendsService>(FriendsService, IFriendsServiceSymbol);
	await app.register(FileTransferService, FileTransferServiceSymbol);
	await app.register(Libp2pService, ILibp2pServiceSymbol);
	await app.registerConstant<ILibp2pConfig<any>>({
		addresses: {
			listen: [
				'/p2p-circuit',
				'/webrtc',
			],
		},
		transports: [
			webTransport(),
			webSockets(),
			webRTC(),
			webRTCDirect(),
			circuitRelayTransport({
				reservationConcurrency: 3,
			}),
		],
		streamMuxers: [
			yamux(),
		],
		connectionEncrypters: [
			noise(),
		],
		connectionGater: {
			// Allow private addresses for local testing
			denyDialMultiaddr: async () => false,
		},
		peerDiscovery: [
			bootstrap({
				list: [
					'/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
					'/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
					'/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
					'/dnsaddr/va1.bootstrap.libp2p.io/p2p/12D3KooWKnDdG3iXw9eTFijk3EWSunZcFi54Zka4wmtqtt6rPxc8',
					'/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
					'/ip4/185.66.109.132/tcp/4001/p2p/12D3KooWPUFuhVZ1YnKrG49TtCWNmaxUag6q2JhBbabRCMJhoDLo',
					'/ip4/185.66.109.132/tcp/6001/ws/p2p/12D3KooWPUFuhVZ1YnKrG49TtCWNmaxUag6q2JhBbabRCMJhoDLo',
				],
				//tagTTL: Infinity,
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
	app.registerConstant<any>(new IDBDatastore('libp2p-data'), IDatastoreSymbol);

	// Startup actions
	app.registerStartupAction((app) => app.getService<IDBDatastore>(IDatastoreSymbol).open());
	app.registerStartupAction((app) => app.getService<Libp2pService>(ILibp2pServiceSymbol).start());
	app.registerStartupAction((app) => app.getService<FriendsService>(IFriendsServiceSymbol).start());
	app.registerStartupAction((app) => app.getService<FileTransferService>(FileTransferServiceSymbol).init());
};
