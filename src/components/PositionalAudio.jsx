import { AudioListener, AudioLoader } from "three";
import { useLoader, useThree } from "@react-three/fiber";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";

export const PositionalAudio = forwardRef(function PositionalAudio(
    { url, distance = 1, loop = false, autoplay, audioListener, ...props },
    ref
) {
    const sound = useRef(null);
    useImperativeHandle(ref, () => sound.current, []);
    const camera = useThree(({ camera }) => camera);
    const [listener] = useState(() => audioListener || new AudioListener());
    const buffer = useLoader(AudioLoader, url);

    useEffect(() => {
        const _sound = sound.current;
        if (_sound) {
            _sound.setBuffer(buffer);
            _sound.setRefDistance(distance);
            _sound.setLoop(loop);
            if (autoplay && !_sound.isPlaying) _sound.play();
        }
    }, [buffer, camera, distance, loop, autoplay]);

    useEffect(() => {
        const _sound = sound.current;
        if (!audioListener) camera.add(listener);
        return () => {
            if (!audioListener) camera.remove(listener);
            if (_sound) {
                if (_sound.isPlaying) _sound.stop();
                if (_sound.source && _sound.source._connected)
                    _sound.disconnect();
            }
        };
    }, [sound, audioListener, listener, camera]);

    return <positionalAudio ref={sound} args={[listener]} {...props} />;
});

export default PositionalAudio;
