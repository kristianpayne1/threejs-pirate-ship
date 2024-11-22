import { useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Audio, AudioListener, AudioLoader } from "three";

function useAmbientSound({
    url = "",
    loop = true,
    volume = 1,
    play = true,
    audioListener,
}) {
    const { camera } = useThree();

    const listener = useMemo(() => audioListener || new AudioListener(), []);
    const sound = useMemo(() => new Audio(listener), [listener]);

    const buffer = useLoader(AudioLoader, url);

    useEffect(() => {
        if (!camera || !listener) return;
        if (!audioListener) camera.add(listener);
        return () => {
            if (!audioListener) camera.remove(listener);
        };
    }, [camera, listener, audioListener]);

    useEffect(() => {
        if (!buffer || !sound) return;
        sound.setBuffer(buffer);
    }, [buffer, sound]);

    useEffect(() => {
        sound.loop = loop;
    }, [loop, sound]);

    useEffect(() => {
        sound.volume = volume;
    }, [sound, volume]);

    useEffect(() => {
        if (!sound) return;
        if (play) sound.play();
    }, [sound, play]);

    return sound;
}

export default useAmbientSound;
