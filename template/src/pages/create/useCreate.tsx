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
import React, {createContext} from 'react';
import {createHook} from 'fpe-implementation';
import {CreateMeetingDataInterface} from '../../utils/useCreateMeeting';

export interface CreateContextInterface {
  useCreateMeeting: () => (
    roomTitle: string,
    enablePSTN?: boolean,
  ) => Promise<CreateMeetingDataInterface>;
  showShareScreen: (
    createMeetingData: CreateMeetingDataInterface,
    roomTitle: string,
    isSeparateHostLink: boolean,
  ) => void;
}

const CreateContext = createContext<CreateContextInterface>(
  {} as CreateContextInterface,
);

interface CreateProviderProps {
  value: CreateContextInterface;
  children: React.ReactNode;
}

const CreateProvider = (props: CreateProviderProps) => {
  return (
    <CreateContext.Provider value={{...props.value}}>
      {props.children}
    </CreateContext.Provider>
  );
};
const useCreate = createHook(CreateContext);

export {CreateProvider, useCreate};