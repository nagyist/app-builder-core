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
import {useContext} from 'react';
import ChatContext from '../components/ChatContext';
import {UidInterface} from '../../agora-rn-uikit';

export enum MESSAGE_TYPE {
  group,
  private,
}
function useSendMessage() {
  const {sendMessage, sendMessageToUid} = useContext(ChatContext);
  return (type: MESSAGE_TYPE, message: string, uid?: UidInterface['uid']) => {
    switch (type) {
      case MESSAGE_TYPE.group:
        sendMessage(message);
        break;
      case MESSAGE_TYPE.private:
        if (uid) {
          sendMessageToUid(message, uid);
        } else {
          console.error('To send the private message, UID should be passed');
        }
        break;
      default:
        break;
    }
  };
}

export default useSendMessage;