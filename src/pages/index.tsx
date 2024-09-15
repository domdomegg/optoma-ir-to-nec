import clsx from 'clsx';
import { useState } from 'react';

const Home = () => {
  const [byte1, setByte1] = useState('32');
  const [byte2, setByte2] = useState('CD');
  const [byte3, setByte3] = useState('02');
  const [byte4, setByte4] = useState('');

  const isValid = isByte(byte1) && isByte(byte2) && isByte(byte3) && (isByte(byte4) || byte4 === '');

  return (
    <main className="p-8 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Convert Optoma IR remote codes to the NEC protocol</h1>
      <p>Got an Optoma projector? This tool will convert the manual's infrared remote control codes to codes in the NEC protocol.</p>
      <p>These can then be used in tools that support NEC codes, like ESPHome.</p>
      <h2 className="text-xl font-bold !mt-8">Optoma code</h2>
      <p>Enter the Optoma code to convert from the manual.</p>
      <div className="grid grid-cols-4 gap-2">
        <ByteControl index={1} byte={byte1} setByte={setByte1} />
        <ByteControl index={2} byte={byte2} setByte={setByte2} />
        <ByteControl index={3} byte={byte3} setByte={setByte3} />
        <ByteControl index={4} byte={byte4} setByte={setByte4} />
      </div>
      <details className="space-y-4">
        <summary>Help</summary>
        <p>You can find your manual on the <a href="https://www.optoma.co.uk/service-and-support/lookup" className="text-blue-500 underline">Optoma website</a>. Look for the section titled 'IR remote control codes', usually under 'Additional information'.</p>
        <p>If you can't find your specific projector, but you're sure it supports IR control, try the codes for <a href="https://www.optoma.co.uk/ContentStorage/Documents/29b3f7fa-ebe0-4c0c-8208-95eed6d6e9c6.pdf#page=53" className="text-blue-500 underline">a different projector</a>.</p>
        <p>If your manual just specifies three bytes, just leave the last one blank!</p>
        <p>If your manual mentions repeat or NEC formats, this doesn't matter. These refer to NEC1 and NEC2 formats, the difference being that NEC2 just automatically repeats if you keep holding down the button - often used for arrow navigation or volume buttons.</p>
      </details>
      <h2 className="text-xl font-bold !mt-8">NEC code</h2>
      {isValid
        ? <NecCode byte1={byte1} byte2={byte2} byte3={byte3} byte4={byte4} />
        : <p>Enter the first three bytes of the Optoma code</p>}
    </main>
  );
};

const ByteControl = ({ index, byte, setByte }: { index: number, byte: string; setByte: (value: string) => void }) => {
  const isError = !isByte(byte) && byte !== '';

  return (
    <label>
      Byte {index}<br />
      <input
        type="text"
        value={byte}
        onChange={(e) => setByte(e.target.value.replaceAll(/[^0-9A-F]/gi, '').toUpperCase())}
        className={clsx('w-full border border-gray-300 rounded px-2 py-1 font-mono text-3xl', isError && 'border-red-500 outline-red-500')}
      />
      {isError && <p className="text-red-500">Invalid byte</p>}
    </label>
  );
};

const NecCode = ({
  byte1, byte2, byte3, byte4,
}: { byte1: string; byte2: string; byte3: string; byte4: string }) => {
  const address = `0x${byte2}${byte1}`;
  const command = `0x${byte4 || inverse(byte3)}${byte3}`;

  return (
    <>
      <p>Address</p>
      <code className="font-mono select-all text-3xl">{address}</code>
      <p>Command</p>
      <code className="font-mono select-all text-3xl">{command}</code>
      <details className="space-y-4 !mt-8">
        <summary>ESPHome example</summary>
        <code className="block whitespace-pre">{`esphome:
  name: optoma-controller

# ...

remote_transmitter:
  - pin: D7
    carrier_duty_percent: 50%

button:
  - platform: template
    name: "Optoma control button"
    on_press:
      - remote_transmitter.transmit_nec:
          address: ${address}
          command: ${command}`}
        </code>
      </details>
    </>
  );
};

const isByte = (value: string) => /^[0-9A-F]{2}$/i.test(value);

const inverse = (value: string) => (0xFF - parseInt(value, 16)).toString(16).padStart(2).toUpperCase();

export default Home;
