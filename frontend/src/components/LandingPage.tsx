import { useEffect, useRef, useState } from "react"
import Room from "./Room";
import { FaInfinity } from "react-icons/fa";
import { TbCamera } from "react-icons/tb";
import { TbCameraOff } from "react-icons/tb";
import { IoMicOutline } from "react-icons/io5";
import { IoMicOffOutline } from "react-icons/io5";
import Navbar from "./Navbar";


const LandingPage = () => {
  const [name, setName] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  const [localVideoTrack, setLocalVideoTrack] = useState<null | MediaStreamTrack>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<null | MediaStreamTrack>(null);
  const [isVideoDisabled, setIsVideoDisabled] = useState<boolean>(false);
  const [isAudioDisabled, setIsAudioDisabled] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const getCam = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];

    setLocalAudioTrack(audioTrack);
    setLocalVideoTrack(videoTrack);

    if (!videoRef.current) {
      return;
    }
    // play video an audio for hair screen
    videoRef.current.srcObject = new MediaStream([videoTrack]);
    videoRef.current.play();
  };

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCam();
    }

  }, [videoRef])

  const handleToggleVideo = () => {
    setIsVideoDisabled(prev => !prev);
  };
  const handleToggleAudio = () => {
    setIsAudioDisabled(prev => !prev);
  };
  if (!joined) {
    return (
      <div className="w-screen h-screen bg-grey-5">
        {/* navbar  */}
       <Navbar/>

        <div className="w-full h-[calc(100vh-80px)] bg-grey-5 flex justify-center items-center gap-x-5">
          <div className="w-[740px] h-[420px] flex justify-center items-center relative">
            {/* preview player  */}
            <video autoPlay ref={videoRef} className="h-[420px] aspect-video bg-black-25 shadow-2xl shadow-black-50  rounded-[10px]"></video>

            <div className="w-full h-[50px] flex justify-center items-center gap-5 absolute bottom-2 left-0 z-[200]">
              <button onClick={handleToggleVideo} className={`media-btn ${isVideoDisabled ? "border-red border-opacity-50 text-red text-opacity-50" : " border-grey-5 text-grey-5 "} `}>
                {
                  isVideoDisabled ? <TbCameraOff /> : <TbCamera />
                }
              </button>

              <button onClick={handleToggleAudio} className={`media-btn ${isAudioDisabled ? "border-red border-opacity-50 text-red text-opacity-50" : " border-grey-5 text-grey-5 "} `}>
                {
                  isAudioDisabled ? <IoMicOffOutline /> : <IoMicOutline />
                }
              </button>
            </div>
          </div>

          <form className="w-[30%] h-full flex flex-col justify-center items-center gap-y-5">
            <p className="text-[30px] font-semibold text-black-25 font-sans ">Ready to Join ?</p>
            <input
              type="text"
              onChange={(e) => {
                setName(e.target.value);
              }}
              value={name}
              placeholder="Enter Your Name"
              className="h-[40px] w-[300px] bg-white rounded-[20px] border-2 border-black-25 overflow-hidden placeholder:text-black-50 placeholder:text-opacity-50 text-black-25 text-[13px]  pl-4 flex justify-center items-center focus:ring-0 "
            />

            <button onClick={() => setJoined(true)} className="h-[40px] w-[300px] bg-black-25 rounded-[20px]  text-grey-5 text-[13px] flex justify-center items-center "
            > Join room</button>
          </form>
        </div>

      </div>
    )
  }

  return <Room name={name} localVideoTrack={localVideoTrack} localAudioTrack={localAudioTrack} />
}

export default LandingPage