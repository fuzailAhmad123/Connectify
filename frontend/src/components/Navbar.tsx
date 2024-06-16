import { FaInfinity } from "react-icons/fa"


const Navbar = () => {
  return (
    <div className="w-full min-h-[80px] bg-black-25 flex justify-between items-center px-14">
          <div className="w-[30%] h-[80px] flex items-center gap-5 ">
            <p className="text-grey-5 text-[36px] scale-150"><FaInfinity /></p>
            <p className="text-[26px] text-grey-5 font-bold">CONNECTIFY</p>
          </div>
        </div>
  )
}

export default Navbar