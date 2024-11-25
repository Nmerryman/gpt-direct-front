'use client'

import { useState, Dispatch, SetStateAction, ChangeEvent } from "react";
import Popup from "reactjs-popup";
import { PingMessage } from "./api/ping";
import { AuthRequest } from "./api/authReq";
import { AuthResponse } from "./api/authResp";
import Cookies from "universal-cookie";
import { GptRequest } from "./api/gptRequest";
import { GptResponse } from "./api/gptResponse";


const API_URL = "api";


async function attemptLogin(setStatus: Dispatch<SetStateAction<string>>, textValue: string) {
  setStatus("Attempting login");

  const res = await fetch(API_URL + "/auth",
    {
      method: "POST",
      headers: 
          {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          },
      credentials: "include", 
      body: JSON.stringify(new AuthRequest(textValue))
    }
  );

  if (!res.ok) {
    throw new Error("Backend didn't respond");
  }

  const authResponse: AuthResponse = await res.json()

  if (authResponse.token.length > 0) {
    // const [cookies, setCookie, remove_cookie] = useCookies(['auth'])
    const cookies = new Cookies(null, {path: "/"});
    cookies.set("auth", authResponse.token, {sameSite: "none", secure: true});
    console.log(cookies.get("auth"));
    setStatus("Login Sucessful.");
    // console.log(1)
  } else {
    setStatus("Login Failed.");
  }

}

function LoginBtn() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [passField, setPassField] = useState("");

  return (
    <div>
      <button className="outline outline-1 grow" onClick={() => setOpen(true)}>Log in</button>
      <Popup open={open} onClose={() => setOpen(false)}>
        <div className="modal outline outline-1 outline-white" >
          <span>Enter the password</span>
          <div>
            <input type="text" placeholder="password" className="text-black" onChange={(e: ChangeEvent<HTMLInputElement>) => {setPassField(e.target.value)}} value={passField}></input>
            <button onClick={() => {attemptLogin(setStatus, passField)}}>Send</button>
          </div>
          <span>{status}</span>
        </div>
      </Popup>
    </div>
  )
}

function Header() {
  return (
    <div className="flex justify-center">
      <span className="text-3xl">GPT Direct</span>
      <div className="absolute right-4 top-4 w-1/12 flex justify-center">
        <LoginBtn></LoginBtn>
      </div>
    </div>
  )
}


async function ping() {
    return fetch(API_URL + "/ping", 
        {
        method: "POST", 
        headers: 
            {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            }, 
        body: JSON.stringify(new PingMessage("pinged!"))
        }
    )
}

async function request(systemText: string, userText: string, setResultText: Dispatch<SetStateAction<string>>) {
  console.log(1);
  const res = await fetch(API_URL + "/request",
  {
    method: "POST",
    body: JSON.stringify(new GptRequest(systemText, userText))
  })
  console.log(2)

  if (!res.ok) {
    throw new Error("Request errored for some reason");
  }
  console.log(3)
  const content: GptResponse = await res.json();

  setResultText(content.text);

}

export default function Home() {

  const [systemText, setSystemText] = useState("");
  const [userText, setUserText] = useState("");
  const [resultText, setResultText] = useState("");
  
  return (
    <div>
      <Header></Header>
      <br/>
      System prompt!!!!
      <br/>
      <textarea className="text-black" value={systemText} onChange={(e) => {setSystemText(e.target.value)}}></textarea>
      <br/>
      User Prompt
      <br/>
      <textarea className="text-black" value={userText} onChange={(e) => {setUserText(e.target.value)}}></textarea>
      <br/>

      <button className="outline outline-1" onClick={() => {request(systemText, userText, setResultText)}}>Request</button>
      <button className="outline outline-1" onClick={() => {fetch(API_URL + "/greeting").then(resp => {console.log(resp.text())})}}>Greeting</button>
      <button className="outline outline-1" onClick={ping}>Ping</button>
      <button className="outline outline-1" onClick={() => {fetch(API_URL + "/authtest", {method: "POST"})}}>AuthTest</button>
      <br/>
      Result
      <br/>
      <textarea className="text-black" value={resultText} readOnly></textarea>
    </div>
  );
}
