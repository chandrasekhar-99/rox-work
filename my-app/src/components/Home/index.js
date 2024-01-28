import React,{useState, useEffect} from 'react'
import './index.css'

const Home = ()=>{
  const [data,setData] = useState(null)
  

  useEffect(()=>{
    fetch("http://localhost:8000/api")
    .then(res => res.json())
    .then(data => setData(data.message))
    .catch(err => console.log(err))
  })
  

  
    return(
      <div>
        <p>{data ? data : "Loading..."}</p>
      </div>
    )
  
}

export default Home