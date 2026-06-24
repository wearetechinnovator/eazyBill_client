import React, { useEffect, useRef, useState } from 'react'
import { IoClose } from "react-icons/io5";
import { FaMinus } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { calcToggle } from '../store/calculatorSlice';


const Calculator = () => {
  const dragItem = document.getElementById('calculator');
  const isCalculatorShow = useSelector(state => state.calculator.show);
  const dispatch = useDispatch();
  const [calcValue, setCalcValue] = useState('');
  const inputRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);


  useEffect(() => {
    if (isMinimized) {
      document.getElementById('calcBody').style.display = 'none';
      document.getElementById('calculator').setAttribute('style', `
        height: 35px;bottom:0;right:0;
        `)
    } else {
      document.getElementById('calcBody').style.display = 'block';
      document.getElementById('calculator').setAttribute('style', `
        height: 310px;bottom:0;right:0;
        `);
    }
  }, [isMinimized])

  // Variables for tracking the mouse position
  let offsetX = 0, offsetY = 0;
  let isDragging = false;

  const onMouseDown = (e) => {
    isDragging = true;
    // Get the initial position of the mouse
    offsetX = e.clientX - dragItem.getBoundingClientRect().left;
    offsetY = e.clientY - dragItem.getBoundingClientRect().top;

    // Add event listeners to move the div
    dragItem.addEventListener('mousemove', onMouseMove);
    dragItem.addEventListener('mouseup', onMouseUp);
  };


  function onMouseMove(e) {
    if (isDragging) {
      // Move the div as the mouse moves
      dragItem.style.left = e.clientX - offsetX + 'px';
      dragItem.style.top = e.clientY - offsetY + 'px';
    }
  }

  function onMouseUp() {
    isDragging = false;

    dragItem.removeEventListener('mousemove', onMouseMove);
    dragItem.removeEventListener('mouseup', onMouseUp);
  }

  const setValue = (e) => {
    setCalcValue((pv) => pv + e.target.innerText);
    inputRef.current.focus();
  }


  return (
    <div
      id='calculator'
      className={`calculator absolute bg-white w-[250px] h-[310px] rounded shadow-lg z-[99999999] bottom-0 right-0 border ${isCalculatorShow !== 0 ? 'block' : 'hidden'}`}>
      {/* header */}
      <div className='flex justify-between items-center bg-gray-300 p-2 mb-5' onMouseDown={onMouseDown}>
        <p className='text-[12px]'>Calculator</p>
        <div className='flex justify-between'>
          <div
            onClick={() => dispatch(calcToggle(0))}
            className='w-4 h-4 cursor-pointer bg-red-500 rounded-full flex items-center justify-center text-white'>
            <IoClose />
          </div>
          <div
            onClick={()=>setIsMinimized(!isMinimized)}
            className='w-4 h-4 cursor-pointer bg-yellow-500 rounded-full flex items-center justify-center ml-2 text-white'>
            <FaMinus />
          </div>
        </div>
      </div>
      <div className='p-2' id='calcBody'>
        <input type="text"
          ref={inputRef}
          className='w-full p-3 text-right'
          onChange={(e) => setCalcValue(e.target.value)}
          value={calcValue}
        />
        <div className='grid grid-cols-4 gap-1 mt-1'>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>7</button>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>8</button>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>9</button>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>/</button>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>4</button>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>5</button>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>6</button>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>*</button>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>1</button>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>2</button>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>3</button>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>-</button>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>0</button>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>.</button>
          <button className='p-3 bg-gray-200' onClick={() => {
            try {
              setCalcValue(eval(calcValue));
            } catch (e) {
              setCalcValue('Error');
            }
            inputRef.current.focus();
          }}>=</button>
          <button className='p-3 bg-gray-200' onClick={(e) => setValue(e)}>+</button>
        </div>
      </div>
    </div>
  )
}

export default Calculator