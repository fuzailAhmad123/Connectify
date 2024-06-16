import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import Navbar from "./Navbar";
import { PiHandWavingDuotone } from "react-icons/pi";
import { useForm } from "react-hook-form";
import { BsFillSendFill } from "react-icons/bs";

const URL = "http://localhost:3000"

interface Data {
  name: string,
  localVideoTrack: MediaStreamTrack | null,
  localAudioTrack: MediaStreamTrack | null
}
const Room = ({
  name, localVideoTrack, localAudioTrack
}: Data) => {
  // const [searchParams, setSerachParams] = useSearchParams();
  // const name = searchParams.get('name');
  const [lobby, setLobby] = useState<boolean>(false);
  const [socket, setSocket] = useState<null | Socket>(null);
  const [sendingPC, setSendingPC] = useState<null | RTCPeerConnection>(null);
  const [receivingPC, setReceivingPC] = useState<null | RTCPeerConnection>(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<null | MediaStreamTrack>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState<null | MediaStreamTrack>(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState<null | MediaStream>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const {
    register, handleSubmit
  } = useForm();
  useEffect(() => {
    //logic to enter user in room
    const socket = io(URL);

    //send offer
    socket.on("send-offer", async ({ roomId }) => {
      // alert("send offer please");
      setLobby(false);
      console.log("Sending Offer")
      const pc = new RTCPeerConnection();
      setSendingPC(pc);
      if (localAudioTrack) {
        pc.addTrack(localAudioTrack);
      }
      if (localVideoTrack) {
        pc.addTrack(localVideoTrack);
      }

      // stun/ice server req for getting your ip 
      pc.onicecandidate = async (e) => {
        console.log("Receiving Ice candidate locally")
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
            roomId
          })
        }
      }

      pc.onnegotiationneeded = async () => {
        console.log("on negotiation needed , sending offer")
        const sdp = await pc.createOffer();
        //@ts-ignore
        pc.setLocalDescription(sdp);
        socket.emit("offer", {
          sdp,
          roomId
        })
      }
    });

    // receive an offer 
    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      // alert("send answer please");
      setLobby(false);
      console.log("Receiving Offer")
      const pc = new RTCPeerConnection();
      window.pcr = pc;
      pc.setRemoteDescription(remoteSdp);

      const sdp = await pc.createAnswer();
      //@ts-ignore
      pc.setLocalDescription(sdp);
      // reset the media stream everytime 
      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setRemoteMediaStream(stream)
      //trickle ice
      setReceivingPC(pc);

      pc.onicecandidate = async (e) => {
        console.log("On ice candidate, receiving offer")
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId
          })
        }
      }

      pc.ontrack = (e) => {
        // const {track, type} = e;
        //  if(type === "audio"){
        //   // setRemoteAudioTrack(track);
        //   //@ts-ignore
        //   remoteVideoRef.current?.srcObject.addTrack(track);
        //  }else{
        //   // setRemoteVideoTrack(track);
        //    //@ts-ignore
        //    remoteVideoRef.current?.srcObject.addTrack(track);
        //  }
        //  remoteVideoRef.current?.play();
      }

      socket.emit("answer", {
        sdp: sdp,
        roomId
      })


      setTimeout(() => {
        const track1 = window.pcr.getTransceivers()[0].receiver.track;
        const track2 = window.pcr.getTransceivers()[1].receiver.track;

        if (track1.kind === "video") {
          setRemoteAudioTrack(track2);
          setRemoteVideoTrack(track1);
        } else {
          setRemoteAudioTrack(track1);
          setRemoteVideoTrack(track2);
        }

        //@ts-ignore
        remoteVideoRef.current?.srcObject.addTrack(track1);

        //@ts-ignore
        remoteVideoRef.current?.srcObject.addTrack(track2);

        //@ts-ignore
        remoteVideoRef.current.play();

      }, 5000)
    });

    socket.on("lobby", () => {
      setLobby(true);
    })

    //receives an answer
    socket.on("answer", ({ roomId, sdp: remoteSdp }) => {
      // alert("connection done");
      setLobby(false);

      setSendingPC(pc => {
        pc?.setRemoteDescription(remoteSdp);
        return pc;
      })

      console.log("loop closed")
    })

    socket.on("add-ice-candidate", ({ candidate, type }) => {
      console.log("Adding ice candidate remote");
      console.log({ candidate, type });
      if (candidate === "sender") {
        setReceivingPC(pc => {
          pc?.addIceCandidate(candidate);
          return pc;
        })
      } else {
        setSendingPC(pc => {
          pc?.addIceCandidate(candidate);
          return pc;
        })
      }
    })
    setSocket(socket);
  }, [name]);

  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideoTrack) {
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
        localVideoRef.current.play();
      }
    }
  }, [localVideoRef])
  return (
    <div className="w-screen h-screen bg-grey-5">
      <Navbar />

      <div className="w-full min-h-[calc(100vh-80px)] h-fit  flex items-start justify-start">
        <div className="w-[35%] min-h-[calc(100vh-80px)] h-fit flex flex-col items-center gap-[40px] justify-center bg-black-5   ">
          {/* user 1 Video  */}
          <div className="w-full h-[50%] flex justify-center  items-center">
            <video autoPlay ref={localVideoRef} className="h-[250px] aspect-video bg-black-25 rounded-[10px] overflow-hidden shadow-2xl shadow-black-50 " />
          </div>

          {/* {user 2 Video } */}
          <div className="w-full h-[50%] flex justify-center items-center">
            <video autoPlay ref={remoteVideoRef} className="h-[250px] aspect-video bg-black-25 rounded-[10px] overflow-hidden  shadow-2xl shadow-black-50 " />
          </div>
        </div>

        <div className="w-[65%] min-h-[calc(100vh-80px)] h-fit flex justify-center items-center" >
          {
            lobby ? (
              <div className="w-full min-h-[calc(100vh-80px)] h-fit flex flex-col justify-center items-center gap-y-5 ">
                <div className="lds-hourglass"></div>
                <p className="text-3xl font-bold font-sans text-black-5 flex items-center gap-2 ">
                  <span>Hello {name}</span>
                  <span><PiHandWavingDuotone /></span>
                </p>
                <p className="text-xl font-semibold font-sans text-black-50">Waiting to connect you to someone.</p>
              </div>) : (<div className="w-full min-h-[calc(100vh-80px)] h-fit flex flex-col justify-between items-center gap-y-5 ">
                <div></div>
                <form onSubmit={handleSubmit(() => {})} className="w-full h-[60px] flex items-center gap-x-2 px-2">
                    <input
                       type="text"
                       id="message"
                       placeholder="Enter Message Here......"
                       {...register("message")}
                       className="h-[40px] w-[85%] bg-white rounded-[20px] border-2 border-black-25 overflow-hidden placeholder:text-black-50 placeholder:text-opacity-50 text-black-25 text-[13px]  pl-4 flex justify-center items-center focus:ring-0 " />

                      <button type="submit" className="h-[40px] w-[15%] min-w-[60px] bg-black-25 rounded-[20px]  text-grey-5 text-[13px] flex justify-center items-center gap-x-3 font-sans font-semibold ">
                         Send
                         <BsFillSendFill />
                      </button>
                </form>
              </div>)
          }
        </div>
      </div>
    </div>

  )
}

export default Room



{/* <p>Hello {name}</p>
         <video autoPlay width={400} height={400} ref={localVideoRef} />
        <p>
        {
          lobby ? "Waiting to connect you to someone": null
         }
        </p>
         <video autoPlay width={400} height={400} ref={remoteVideoRef}/> */}