import React, { useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav'
import { useRef } from 'react';
import { FaRegCheckCircle } from "react-icons/fa";
import { LuRefreshCcw } from "react-icons/lu";
import useMyToaster from '../../hooks/useMyToaster';
import { SelectPicker, DatePicker, Button } from 'rsuite';

const RoleAdd = ({mode}) => {
    const accountvalidation = useMyToaster();
    const editorRef = useRef(null);

     const [from, setFrom] = useState({
        title:'', accessModule:''
     })

     const savebutton = (e) => {
       if(from.title === ""|| from.accessModule === "" ){
         return accountvalidation("fill the blank", "warning")                                                                                                               
       }
     }
       
        const fromvalueclear = (e) => {
            setFrom({
                title:'', accessModule:''
             })
        }

    return (
        <>
            <Nav title={"Item Category"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className='content__body__main bg-white '>
                        <div className='  flex justify-between  gap-5 flex-col lg:flex-row'>
                            <div className='w-full'>
                                <div >
                                    <p className='mb-2 '>Title</p>
                                    <input type='text' onChange={(e) => setFrom({...from, title: e.target.value})} value={from.title} />
                                </div>  
                            </div>
                            <div className='w-full pt-1'>
                                <div>
                                  <p className='ml-1 mb-2'>Access Module</p>
                                  <select onChange={(e) => setFrom({...from, accessModule: e.target.value})} value={from.accessModule}>
                                        <option value={""}>
                                            select an option
                                        </option>
                                       <option value={"Account"}>
                                           Account
                                       </option>
                                       <option value={"  Banner Category"}>
                                            Banner Category
                                       </option>
                                       <option value={"Banner"}>
                                            Banner 
                                       </option>
                                       <option value={"Blog Category"}>
                                            Blog Category
                                       </option>
                                       <option value={"Blog"}>
                                            Blog
                                       </option>
                                       <option value={"Blog Tag"}>
                                            Blog Tag
                                       </option>
                                   </select>
                                </div>  
                            </div>
                        </div>
                        <div className='mt-3 '>
                            <p className='ml-2 pb-2'>Details</p>
                            {/* <Editor 
                                apiKey='765rof3c4qgyk8u59xk0o3vvhvji0y156uwtbjgezhnbcct7'
                                onInit={(_evt, editor) => editorRef.current = editor}
                                init={{  
                                     height: 300,
                                      menubar: false,
                                       plugins: [
                                         'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                         'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                     ],
                                       toolbar: 'undo redo | blocks | ' +
                                         'bold italic forecolor | alignleft aligncenter ' +
                                         'alignright alignjustify | bullist numlist outdent indent | ' +
                                         'removeformat | help',
                                       content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                }}
                            /> */}
                        </div>
                       <div className='flex justify-center pt-9 mb-6'>
                             <div className='flex rounded-sm bg-green-500 text-white'>
                              <FaRegCheckCircle className='mt-3 ml-2' />
                                <button className='p-2' onClick={savebutton}>{mode? "Update" : "Save"}</button>
                            </div>
                              <div className='flex rounded-sm ml-4 bg-blue-500 text-white'>
                                <LuRefreshCcw className='mt-3 ml-2' />
                                 <button className='p-2' onClick={fromvalueclear}>Reset</button>
                              </div>
                             {/* <div className="flex rounded-sm ml-4 bg-gray-500 text-white">
                                 <IoMdArrowRoundBack className='mt-3 ml-2' />
                                 <button className='p-2'>Back</button>
                                 </div>*/}
                        </div>  
                    </div>
                </div>
            </main>
        </>
  )
}

export default RoleAdd