import { Outlet } from "react-router-dom";

const Nav = () => {
  return (
    <>
      <nav className="w-full bg-white border-gray-200">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <div className="w-full block w-auto" id="navbar-default">
            <ul className="font-medium flex  p-0  rounded-lg  flex-row space-x-8 rtl:space-x-reverse mt-0 bg-white">
              <li>
                <a
                  href="/"
                  className="block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0"
                  aria-current="page"
                >
                  หน้าหลัก
                </a>
              </li>
              <li>
                <a
                  href="/income"
                  className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 "
                >
                  รายรับ
                </a>
              </li>
              <li>
                <a
                  href="/expense"
                  className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 "
                >
                  รายจ่าย
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
};
export default Nav;
