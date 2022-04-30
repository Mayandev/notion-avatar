import { useState } from 'react';

export const useModalStates = <T>(modalKeyMap: T) => {
  const initModalStates = Object.keys(modalKeyMap).reduce(
    (prev, cur) => Object.assign(prev, { [cur]: false }),
    {} as { [key in keyof T]: boolean },
  );
  const [modalStates, setModalStates] = useState(initModalStates);

  const toggleModal = (key: keyof T) => {
    setModalStates({ ...initModalStates, [key]: !modalStates[key] });
  };

  return { modalStates, toggleModal };
};
