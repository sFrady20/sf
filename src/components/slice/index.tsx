import React, { ReactNode, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Mesh, PerspectiveCamera } from "three";

type MeshProps = React.ComponentPropsWithRef<"mesh">;

const Slice = (
  props: { children?: ReactNode; distance?: number } & MeshProps
) => {
  const { children, distance = 0, ...rest } = props;

  const meshRef = useRef<Mesh>(null);

  const { size, camera } = useThree();
  const pc = camera as PerspectiveCamera;
  let fov_y = (pc.position.z * pc.getFilmHeight()) / pc.getFocalLength();

  return (
    <mesh {...rest} ref={meshRef} position={[0, 0, -distance]}>
      <planeGeometry
        args={[
          ((fov_y * size.width) / size.height) * (1 + distance),
          fov_y * (1 + distance),
        ]}
      />
      {children}
    </mesh>
  );
};

export default Slice;
