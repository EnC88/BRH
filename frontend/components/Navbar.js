"use client";
import React, {useState, useEffect} from 'react';
import {faBars, faClose, faCoffee} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    //handle scroll
    const handleScroll = () => {
        if(window.scrollY > 60){
            setIsScrolled(true);
        }
        else{
            setIsScrolled(false);
        }
    }

    //apply the scroll
    useEffect( () => {
        window.addEventListener("scroll", handleScroll);
        return () => { 
            window.removeEventListener("scroll", handleScroll);
        }
    }, [])


    const [hamburgerOpen, setIsHamburgerOpen] = useState(false);

    //handle hamburger click
    const handleClick = () => {
        setIsHamburgerOpen(!hamburgerOpen);
    };

    //autoShow hamburger based on screen size
    useEffect (() => {
        const resize = () => {
            if(window.innerWidth >= 640){
                setIsHamburgerOpen(false);
            }
        };
        window.addEventListener("resize", resize);
        resize();
        return () => {
            window.removeEventListener("resize", resize);
        }
    }, [])


  return (
    <div>
        
    </div>
  )
}

export default Navbar