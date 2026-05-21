import React from 'react';
import { Image } from 'react-native';

interface CitLogoProps {
  size?: number;
  textColor?: string;
  showText?: boolean;
}

export const CitLogo = ({ size = 40 }: CitLogoProps) => {
  return (
    <Image 
      source={require('../../assets/cit-u-logo.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
};

