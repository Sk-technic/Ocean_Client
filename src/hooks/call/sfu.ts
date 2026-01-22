import type { DtlsParameters } from "mediasoup-client/types";
import { getSocket } from "../../api/config/socketClient";
import { getDevice } from "../../webrtc/device";
import type { RtpParameters } from "mediasoup-client/types";

import type { MediaKind } from "mediasoup-client/types";


interface ConsumeResponse {
    id: string;
    producerId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
    peerId: string; // 🔥 socket.id of producer peer
}
class SFUController {
    roomId!: string;
    recvTransport: any = null;
    sendTransport: any = null;
    remotePeerId: string | null = null;
    remoteStreams = new Map<string | undefined, MediaStream>();
    localStream: MediaStream | null = null;
    deviceLoaded = false;

    private deviceLoadPromise: Promise<void> | null = null;

    async ensureDeviceLoaded(rtpCapabilities: any) {
        const device = await getDevice();

        if (device.loaded) {
            this.deviceLoaded = true;
            return device;
        }

        await device.load({ routerRtpCapabilities: rtpCapabilities });
        this.deviceLoaded = true;

        console.log("✅ Device loaded (SFU)", device);
        return device;
    }

    waitForDevice() {
        if (this.deviceLoaded) {
            return Promise.resolve();
        }

        if (this.deviceLoadPromise) {
            return this.deviceLoadPromise;
        }

        this.deviceLoadPromise = new Promise((resolve) => {
            const socket = getSocket();

            socket?.once("rtc:router-capabilities", async (rtpCapabilities) => {
                await this.ensureDeviceLoaded(rtpCapabilities);
                resolve();
            });
        });

        return this.deviceLoadPromise;
    }


    async createRecvTransport(roomId: string) {
        const socket = getSocket();
        const device = await getDevice();

        if (!device.loaded) {
            console.error("❌ createRecvTransport called before device.load");
            return;
        }

        socket?.emit("rtc:create-transport", { roomId, direction: "recv" }, (data: any) => {
            this.recvTransport = device.createRecvTransport({
                ...data,
                appData: { direction: "recv" }
            });

            this.recvTransport.on(
                "connect",
                ({ dtlsParameters }: { dtlsParameters: DtlsParameters }, cb: () => void) => {
                    socket.emit("rtc:connect-transport", {
                        roomId,
                        transportId: this.recvTransport.id,
                        dtlsParameters
                    });
                    cb();
                }
            );
        });
    }
    async consume(producerId: string) {
        const socket = getSocket();
        const device = await getDevice();

        socket?.emit(
            "rtc:consume",
            {
                roomId: this.roomId,
                producerId,
                rtpCapabilities: device.rtpCapabilities
            },
            async ({ id, kind, rtpParameters, peerId }: ConsumeResponse) => {
                let stream = this.remoteStreams.get(peerId);
                if (!stream) {
                    stream = new MediaStream();
                    this.remoteStreams.set(peerId, stream);
                }

                const consumer = await this.recvTransport.consume({
                    id,
                    producerId,
                    kind,
                    rtpParameters
                });

                console.log("consumer tracker : ",consumer.track.enabled);
                
consumer.on("trackended", () => {
  console.log("❌ Consumer track ended:", consumer.kind);
});

consumer.on("transportclose", () => {
  console.log("❌ Consumer transport closed:", consumer.kind);
});
                // Track add karo
                stream.addTrack(consumer.track);
                await consumer.resume();

                if (consumer.kind === "video") {
  socket.emit("rtc:request-keyframe", {
    roomId: this.roomId,
    consumerId: consumer.id
  });
}


                this.remotePeerId = peerId;

                console.log(`✅ Track added: ${kind} for peer: ${peerId}`);

                // UI ko notify karo ki stream change hui hai
                window.dispatchEvent(
                    new CustomEvent("remote-stream-changed", {
                        detail: { peerId }
                    })
                );
            }
        );
    }



    initDevice() {
        const socket = getSocket();

        socket?.on("rtc:router-capabilities", async (rtpCapabilities) => {
            await this.ensureDeviceLoaded(rtpCapabilities);
        });
    }

    initProducerListeners() {
        const socket = getSocket();

        socket?.on("rtc:new-producer", async ({ producerId, peerId }) => {
            if (peerId === socket.id) return;
            console.log("rtc:new-producer", producerId, peerId);

            await this.consume(producerId);
        });
    }
    async startMedia(callType: "audio" | "video") {
        const socket = getSocket();
        const device = await getDevice();

        socket?.emit("rtc:create-transport", { roomId: this.roomId }, async (data: any) => {
            this.sendTransport = device.createSendTransport({
                ...data,
                appData: { direction: "send" }
            });
            this.sendTransport.on(
                "connect",
                ({ dtlsParameters }: { dtlsParameters: DtlsParameters }, callback: () => void) => {
                    socket.emit("rtc:connect-transport", {
                        roomId: this.roomId,
                        transportId: this.sendTransport.id,
                        dtlsParameters
                    });
                    callback();
                }
            );

            this.sendTransport.on(
                "produce",
                ({ kind, rtpParameters }: { kind: MediaKind; rtpParameters: RtpParameters },
                    callback: ({ id }: { id: string }) => void) => {
                    socket.emit(
                        "rtc:produce",
                        {
                            roomId: this.roomId,
                            transportId: this.sendTransport.id,
                            kind,
                            rtpParameters
                        },
                        ({ producerId }: any) => callback({ id: producerId })
                    );
                }
            );

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: callType === "video"
            });

            this.localStream = stream;
            window.dispatchEvent(new Event("local-stream-ready"));

            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                await this.sendTransport.produce({ track: audioTrack });
            }

            if (callType === "video") {
                const videoTrack = stream.getVideoTracks()[0];
                if (videoTrack) {
                    await this.sendTransport.produce({ track: videoTrack });
                }
            }
        });
    }
}



export const sfuState = new SFUController();
