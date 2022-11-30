/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React from 'react';
import Icons, {IconsInterface} from '../assets/Icons';

// export enum IconSize {
//   normal = '',
//   medium = 'medium',
//   small = 'small',
// }

interface ImageIconProps {
  tintColor?: string;
  customSize?: {
    width: number | string;
    height: number | string;
  };
  name: keyof IconsInterface;
  iconSize?: 'normal' | 'medium' | 'small';
}

const ImageIcon = (props: ImageIconProps) => {
  const {name, iconSize = 'normal', customSize, tintColor} = props;
  const SvgComponent = Icons[name];

  return (
    <SvgComponent
      //@ts-ignore
      width={customSize?.width ? customSize.width : styles[iconSize].width}
      height={customSize?.height ? customSize.height : styles[iconSize].height}
      fill={tintColor}
    />
  );
};

export default ImageIcon;

const styles = {
  normal: {
    width: 24,
    height: 24,
  },
  medium: {
    width: 20,
    height: 20,
  },
  small: {
    width: 16,
    height: 16,
  },
};