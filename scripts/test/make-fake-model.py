#!/usr/bin/env python3
"""Small stand-ins for Spleeter 2stems (vocals.onnx / accompaniment.onnx) with the same input and output:
float32 [2 (channels), splits, 512 (frames), bins] -> the same shape (an estimated magnitude). Like the real
files, they declare 1024 bins; scripts/fetch-model.mjs frees that axis, and the app passes 1536 (16 kHz).
The real model cannot be downloaded in the test environment (WEBAPP_BASELINE §12-14). These only scale the
input per frequency bin: the vocals model keeps 300-3400 Hz (bins 28-315) and the accompaniment model the
rest, so a test song whose singing is in that band separates in a predictable way.

Usage: python3 scripts/test/make-fake-model.py <out dir>
Then:  node scripts/fetch-model.mjs --from <out dir> --force
"""
import sys
import numpy as np
import onnx
from onnx import helper, TensorProto, numpy_helper

out = sys.argv[1]
bins = np.arange(1536)
vocal_band = ((bins >= 28) & (bins <= 315)).astype(np.float32)
for name, gain in (("vocals", vocal_band * 0.9 + 0.02), ("accompaniment", (1 - vocal_band) * 0.9 + 0.02)):
    g = numpy_helper.from_array(gain.reshape(1, 1, 1, 1536).astype(np.float32), name="gain")
    node = helper.make_node("Mul", ["x", "gain"], ["y"])
    x = helper.make_tensor_value_info("x", TensorProto.FLOAT, [2, "num_splits", 512, 1024])
    y = helper.make_tensor_value_info("y", TensorProto.FLOAT, [2, "num_splits", 512, 1024])
    graph = helper.make_graph([node], name, [x], [y], initializer=[g])
    model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 13)])
    model.ir_version = 8
    for k, v in (("model_type", "spleeter"), ("stems", "2"), ("sample_rate", "44100")):
        model.metadata_props.append(onnx.StringStringEntryProto(key=k, value=v))
    onnx.checker.check_model(model)
    onnx.save(model, f"{out}/{name}.onnx")
    print("wrote", f"{out}/{name}.onnx")
