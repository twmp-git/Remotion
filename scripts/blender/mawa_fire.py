"""
"Mawa" — the burning-slips shot ("ma beti anabeta anapita" ×2), built and rendered in Blender (bpy).

Original stylised scene in the cover's palette: a pile of generic paper slips that burn through
(glowing edge, char band, holes), toon-banded flame cards, real flickering firelight, embers with
motion blur, paper planes taking off, and a final wall of fire. Timed to the aligned word times.

Usage:
  python scripts/blender/mawa_fire.py OUT_DIR [--frames A-B] [--samples N] [--scale PCT]
Renders PNG frames OUT_DIR/f_####.png (1080×1920 @ 30 fps, frames 1..128 = song 1:50.84–1:55.10).
"""
import math
import random
import sys

import bpy
import numpy as np

args = sys.argv[1:]
OUT = args[0]
FRAMES = (1, 128)
SAMPLES = 20
SCALE = 100
for i, a in enumerate(args):
    if a == "--frames":
        a0, a1 = args[i + 1].split("-")
        FRAMES = (int(a0), int(a1))
    if a == "--samples":
        SAMPLES = int(args[i + 1])
    if a == "--scale":
        SCALE = int(args[i + 1])

FPS = 30
TOTAL = 128
# Word times relative to the shot start (song 110.84 s = clip 30.84 s).
T = dict(ma1=0.15, beti1=0.35, anabeta1=0.75, anapita1=1.59, ma2=2.35, anabeta2=2.91, anapita2=3.66, end=4.26)
fr = lambda s: 1 + round(s * FPS)

# Palette (sRGB hex from the cover) → linear for shaders.
def lin(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c) + (1.0,)

ORANGE, LIGHT, CREAM, DEEP = lin("#D9782C"), lin("#F2A15A"), lin("#FBE3C4"), lin("#B1713B")
INK, PAPER, CHAR, GROUND = lin("#1C1C1C"), lin("#E8E4DA"), lin("#1A0E08"), lin("#1B1817")

# Ignition curve (same keys as the 2D version).
IGN_KEYS = [(T["ma1"], 0), (T["beti1"], 0.12), (T["anabeta1"], 0.35), (T["anabeta1"] + 0.7, 1.0), (T["ma2"], 1.15),
            (T["anabeta2"], 1.6), (T["anapita2"], 2.1), (T["end"], 6.0)]
def ign(s):
    if s <= IGN_KEYS[0][0]:
        return 0.0
    for (a, va), (b, vb) in zip(IGN_KEYS, IGN_KEYS[1:]):
        if s <= b:
            u = (s - a) / (b - a)
            u = u * u * (3 - 2 * u)
            return va + (vb - va) * u
    return IGN_KEYS[-1][1]

random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = SAMPLES
sc.cycles.use_adaptive_sampling = True
sc.cycles.use_denoising = True
try:
    sc.cycles.denoiser = "OPENIMAGEDENOISE"
except Exception:
    pass
sc.cycles.max_bounces = 4
sc.cycles.transparent_max_bounces = 16
sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
sc.render.resolution_percentage = SCALE
sc.render.fps = FPS
sc.frame_start, sc.frame_end = FRAMES
sc.render.use_motion_blur = True
sc.render.motion_blur_shutter = 0.3
sc.view_settings.view_transform = "Standard"
sc.render.image_settings.file_format = "PNG"
sc.render.filepath = f"{OUT}/f_"

# ---------------------------------------------------------------------------- world: dusk glow
world = bpy.data.worlds.new("dusk")
sc.world = world
world.use_nodes = True
wn = world.node_tree.nodes
wl = world.node_tree.links
wn.clear()
tc = wn.new("ShaderNodeTexCoord")
sep = wn.new("ShaderNodeSeparateXYZ")
ramp = wn.new("ShaderNodeValToRGB")
bg = wn.new("ShaderNodeBackground")
out = wn.new("ShaderNodeOutputWorld")
ramp.color_ramp.elements[0].position = 0.47
ramp.color_ramp.elements[0].color = lin("#5A2E16")
ramp.color_ramp.elements[1].position = 0.75
ramp.color_ramp.elements[1].color = lin("#141110")
mapr = wn.new("ShaderNodeMapRange")
mapr.inputs["From Min"].default_value = -1
mapr.inputs["From Max"].default_value = 1
wl.new(tc.outputs["Generated"], sep.inputs[0])
wl.new(sep.outputs["Z"], mapr.inputs["Value"])
wl.new(mapr.outputs["Result"], ramp.inputs["Fac"])
wl.new(ramp.outputs["Color"], bg.inputs["Color"])
bg.inputs["Strength"].default_value = 1.0
wl.new(bg.outputs["Background"], out.inputs["Surface"])

# ---------------------------------------------------------------------------- helpers
def material(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    m.node_tree.nodes.clear()
    return m, m.node_tree.nodes, m.node_tree.links

def new_obj(name, mesh):
    o = bpy.data.objects.new(name, mesh)
    sc.collection.objects.link(o)
    return o

def grid_plane(name, w, h, cuts=8):
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=cuts, y_subdivisions=cuts, size=1)
    o = bpy.context.active_object
    o.name = name
    o.scale = (w, h, 1)
    bpy.ops.object.transform_apply(scale=True)
    return o

def key_float(target, path, frames_values, interp="BEZIER"):
    for f, v in frames_values:
        setattr(target, path, v)
        target.keyframe_insert(path, frame=f)
    if target.animation_data and target.animation_data.action:
        for fc in fcurves_of(target):
            for kp in fc.keyframe_points:
                kp.interpolation = interp

def fcurves_of(idblock):
    act = idblock.animation_data.action
    if hasattr(act, "fcurves"):
        return list(act.fcurves)
    # Blender 5 layered actions
    out = []
    for layer in act.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                out += list(bag.fcurves)
    return out

# ---------------------------------------------------------------------------- ground
gm, gn, gl = material("ground")
gb = gn.new("ShaderNodeBsdfPrincipled")
gb.inputs["Base Color"].default_value = GROUND
gb.inputs["Roughness"].default_value = 0.95
go = gn.new("ShaderNodeOutputMaterial")
gl.new(gb.outputs[0], go.inputs[0])
bpy.ops.mesh.primitive_plane_add(size=600, location=(0, 200, 0))
ground = bpy.context.active_object
ground.data.materials.append(gm)

hm, hn, hl = material("hill")
hb = hn.new("ShaderNodeBsdfPrincipled")
hb.inputs["Base Color"].default_value = lin("#2A2422")
hb.inputs["Roughness"].default_value = 1.0
ho = hn.new("ShaderNodeOutputMaterial")
hl.new(hb.outputs[0], ho.inputs[0])
bpy.ops.mesh.primitive_uv_sphere_add(radius=320, segments=96, ring_count=48, location=(0, 360, -314))
hill = bpy.context.active_object
hill.data.materials.append(hm)

# ---------------------------------------------------------------------------- slip texture (generic, no brands)
TW, TH = 256, 340
img = np.zeros((TH, TW, 4), dtype=np.float32)
img[..., :3] = np.array(PAPER[:3])
img[..., 3] = 1
img[TH - int(TH * 0.13):, :, :3] = np.array(lin("#2A2A2A")[:3])          # header band (top in image space)
rng = np.random.default_rng(3)
for r in range(7):
    y = TH - int(TH * (0.22 + r * 0.1))
    x1 = int(TW * (0.12 + 0.5 * rng.random()))
    img[y - 4:y + 4, int(TW * 0.1):x1, :3] = np.array(lin("#9A968E")[:3])
    img[y - 5:y + 5, int(TW * 0.82):int(TW * 0.87), :3] = np.array(lin("#2A2A2A")[:3])
img[:4, :, :3] = img[-4:, :, :3] = img[:, :4, :3] = img[:, -4:, :3] = np.array(INK[:3])  # ink border (cover look)
bimg = bpy.data.images.new("slip", TW, TH, alpha=True)
bimg.pixels = img.ravel()
bimg.pack()

# ---------------------------------------------------------------------------- burning-slip material
burn = bpy.data.node_groups  # (unused; per-material value below)
sm, sn, sl = material("slip")
uv = sn.new("ShaderNodeTexCoord")
tex = sn.new("ShaderNodeTexImage")
tex.image = bimg
tex.interpolation = "Closest"
oi = sn.new("ShaderNodeObjectInfo")
burnv = sn.new("ShaderNodeValue")
burnv.name = "BURN"
noise = sn.new("ShaderNodeTexNoise")
noise.inputs["Scale"].default_value = 3.5
# distance from slip centre (UV) + noise
sepuv = sn.new("ShaderNodeSeparateXYZ")
sub_x = sn.new("ShaderNodeMath"); sub_x.operation = "SUBTRACT"; sub_x.inputs[1].default_value = 0.5
sub_y = sn.new("ShaderNodeMath"); sub_y.operation = "SUBTRACT"; sub_y.inputs[1].default_value = -0.25
comb = sn.new("ShaderNodeCombineXYZ")
length = sn.new("ShaderNodeVectorMath"); length.operation = "LENGTH"
nmul = sn.new("ShaderNodeMath"); nmul.operation = "MULTIPLY_ADD"; nmul.inputs[1].default_value = 0.55; nmul.inputs[2].default_value = -0.2
dsum = sn.new("ShaderNodeMath"); dsum.operation = "ADD"
# object delay: random per slip
delay = sn.new("ShaderNodeMath"); delay.operation = "MULTIPLY_ADD"; delay.inputs[1].default_value = 0.6; delay.inputs[2].default_value = 0.0
front = sn.new("ShaderNodeMath"); front.operation = "SUBTRACT"   # front = BURN - delay
x = sn.new("ShaderNodeMath"); x.operation = "SUBTRACT"           # x = front - d
hole = sn.new("ShaderNodeMath"); hole.operation = "GREATER_THAN"; hole.inputs[1].default_value = 0.07
edgeA = sn.new("ShaderNodeMath"); edgeA.operation = "GREATER_THAN"; edgeA.inputs[1].default_value = 0.0
edge = sn.new("ShaderNodeMath"); edge.operation = "SUBTRACT"
charr = sn.new("ShaderNodeMapRange")
charr.inputs["From Min"].default_value = -0.16
charr.inputs["From Max"].default_value = 0.0
charr.clamp = True
mixc = sn.new("ShaderNodeMix"); mixc.data_type = "RGBA"
mixc.inputs[7].default_value = CHAR
bsdf = sn.new("ShaderNodeBsdfPrincipled")
bsdf.inputs["Roughness"].default_value = 0.85
emis = sn.new("ShaderNodeEmission")
emis.inputs["Color"].default_value = LIGHT
emis.inputs["Strength"].default_value = 9
addsh = sn.new("ShaderNodeMixShader")
transp = sn.new("ShaderNodeBsdfTransparent")
cut = sn.new("ShaderNodeMixShader")
mo = sn.new("ShaderNodeOutputMaterial")
sl.new(uv.outputs["UV"], tex.inputs["Vector"])
sl.new(uv.outputs["UV"], sepuv.inputs[0])
sl.new(sepuv.outputs["X"], sub_x.inputs[0]); sl.new(sepuv.outputs["Y"], sub_y.inputs[0])
sl.new(sub_x.outputs[0], comb.inputs["X"]); sl.new(sub_y.outputs[0], comb.inputs["Y"])
sl.new(comb.outputs[0], length.inputs[0])
sl.new(uv.outputs["Object"], noise.inputs["Vector"])
sl.new(noise.outputs["Fac"], nmul.inputs[0])
sl.new(length.outputs["Value"], dsum.inputs[0]); sl.new(nmul.outputs[0], dsum.inputs[1])
sl.new(oi.outputs["Random"], delay.inputs[0])
sl.new(burnv.outputs[0], front.inputs[0]); sl.new(delay.outputs[0], front.inputs[1])
sl.new(front.outputs[0], x.inputs[0]); sl.new(dsum.outputs[0], x.inputs[1])
sl.new(x.outputs[0], hole.inputs[0]); sl.new(x.outputs[0], edgeA.inputs[0])
sl.new(edgeA.outputs[0], edge.inputs[0]); sl.new(hole.outputs[0], edge.inputs[1])
sl.new(x.outputs[0], charr.inputs["Value"])
sl.new(charr.outputs["Result"], mixc.inputs[0])
sl.new(tex.outputs["Color"], mixc.inputs[6])
sl.new(mixc.outputs[2], bsdf.inputs["Base Color"])
sl.new(edge.outputs[0], addsh.inputs[0]); sl.new(bsdf.outputs[0], addsh.inputs[1]); sl.new(emis.outputs[0], addsh.inputs[2])
sl.new(hole.outputs[0], cut.inputs[0]); sl.new(addsh.outputs[0], cut.inputs[1]); sl.new(transp.outputs[0], cut.inputs[2])
sl.new(cut.outputs[0], mo.inputs["Surface"])
# BURN progress keyframes (sampled from the ignition curve)
for f in range(1, TOTAL + 1, 3):
    s = (f - 1) / FPS
    burnv.outputs[0].default_value = max(0.0, (ign(s) - 0.3) * 0.95)
    burnv.outputs[0].keyframe_insert("default_value", frame=f)

# ---------------------------------------------------------------------------- the pile of slips
slips = []
for i in range(30):
    a = random.random() * math.tau
    r = math.sqrt(random.random())
    o = grid_plane(f"slip{i}", 0.55, 0.72, cuts=10)
    o.location = (math.cos(a) * r * 1.45, math.sin(a) * r * 0.6 - 0.25, 0.02 + i * 0.008)
    o.rotation_euler = (math.radians(random.uniform(-14, 14)), math.radians(random.uniform(-14, 14)), random.uniform(0, math.tau))
    bend = o.modifiers.new("curl", "SIMPLE_DEFORM")
    bend.deform_method = "BEND"
    bend.angle = math.radians(random.uniform(-35, 35))
    bend.deform_axis = random.choice(["X", "Y"])
    o.data.materials.append(sm)
    slips.append(o)
# a couple of slips leaning up against the pile, catching more light
for i in range(5):
    o = grid_plane(f"lean{i}", 0.55, 0.72, cuts=10)
    a = -math.pi / 2 + (i - 2) * 0.45
    o.location = (math.cos(a) * 1.0, math.sin(a) * 0.5 - 0.2, 0.28)
    o.rotation_euler = (math.radians(70 + random.uniform(-10, 10)), 0, a + math.pi / 2 + random.uniform(-0.3, 0.3))
    o.data.materials.append(sm)

# ---------------------------------------------------------------------------- toon flame cards
def flame_material(name, seed):
    """Stylised fire: animated noise field shaped by a bell envelope, cut into flat toon bands
    (ink rim → orange → light orange → cream core) with exact cover colours (emission 1.0)."""
    m, n, l = material(name)
    uvn = n.new("ShaderNodeTexCoord")
    mapping = n.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (2.6, 0.85, 1)
    nz = n.new("ShaderNodeTexNoise")
    nz.noise_dimensions = "4D"
    nz.inputs["Scale"].default_value = 1.6
    nz.inputs["Detail"].default_value = 2.0
    nz.inputs["Roughness"].default_value = 0.45
    l.new(uvn.outputs["UV"], mapping.inputs["Vector"])
    l.new(mapping.outputs[0], nz.inputs["Vector"])
    for f, w, yoff in ((1, seed, 0.0), (TOTAL, seed + 6.0, -(TOTAL / FPS) * 2.2)):
        nz.inputs["W"].default_value = w
        nz.inputs["W"].keyframe_insert("default_value", frame=f)
        mapping.inputs["Location"].default_value = (0, yoff, 0)
        mapping.inputs["Location"].keyframe_insert("default_value", frame=f)
    for fc in fcurves_of(m.node_tree):
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"
    sep = n.new("ShaderNodeSeparateXYZ")
    l.new(uvn.outputs["UV"], sep.inputs[0])
    # envelope: (1 - y)^0.8 * (1 - (2|x - 0.5|)^2)
    cx = n.new("ShaderNodeMath"); cx.operation = "SUBTRACT"; cx.inputs[1].default_value = 0.5
    l.new(sep.outputs["X"], cx.inputs[0])
    ax = n.new("ShaderNodeMath"); ax.operation = "MULTIPLY"; ax.inputs[1].default_value = 2.0
    l.new(cx.outputs[0], ax.inputs[0])
    sq = n.new("ShaderNodeMath"); sq.operation = "POWER"; sq.inputs[1].default_value = 2.0
    l.new(ax.outputs[0], sq.inputs[0])
    bell = n.new("ShaderNodeMath"); bell.operation = "SUBTRACT"; bell.inputs[0].default_value = 1.0; bell.use_clamp = True
    l.new(sq.outputs[0], bell.inputs[1])
    oy = n.new("ShaderNodeMath"); oy.operation = "SUBTRACT"; oy.inputs[0].default_value = 1.0; oy.use_clamp = True
    l.new(sep.outputs["Y"], oy.inputs[1])
    py = n.new("ShaderNodeMath"); py.operation = "POWER"; py.inputs[1].default_value = 1.25
    l.new(oy.outputs[0], py.inputs[0])
    env = n.new("ShaderNodeMath"); env.operation = "MULTIPLY"
    l.new(bell.outputs[0], env.inputs[0]); l.new(py.outputs[0], env.inputs[1])
    field = n.new("ShaderNodeMath"); field.operation = "MULTIPLY"
    l.new(nz.outputs["Fac"], field.inputs[0]); l.new(env.outputs[0], field.inputs[1])
    gain = n.new("ShaderNodeMath"); gain.operation = "MULTIPLY"; gain.inputs[1].default_value = 2.35
    l.new(field.outputs[0], gain.inputs[0])
    band = n.new("ShaderNodeValToRGB")
    band.color_ramp.interpolation = "CONSTANT"
    els = band.color_ramp.elements
    els[0].position = 0.0; els[0].color = (0, 0, 0, 0)
    els[1].position = 0.40; els[1].color = INK
    for pos, col in ((0.45, ORANGE), (0.62, LIGHT), (0.82, CREAM)):
        e = els.new(pos); e.color = col
    l.new(gain.outputs[0], band.inputs["Fac"])
    em = n.new("ShaderNodeEmission")
    em.inputs["Strength"].default_value = 1.0
    l.new(band.outputs["Color"], em.inputs["Color"])
    tr = n.new("ShaderNodeBsdfTransparent")
    mix = n.new("ShaderNodeMixShader")
    l.new(band.outputs["Alpha"], mix.inputs[0]); l.new(tr.outputs[0], mix.inputs[1]); l.new(em.outputs[0], mix.inputs[2])
    o = n.new("ShaderNodeOutputMaterial")
    l.new(mix.outputs[0], o.inputs["Surface"])
    return m

cam_target = bpy.data.objects.new("target", None)
sc.collection.objects.link(cam_target)
cam_target.location = (0, 0, 0.9)

flames = []
def flame_card(name, loc, w, h, seed, gain, front=False):
    bpy.ops.mesh.primitive_plane_add(size=1)
    o = bpy.context.active_object
    o.name = name
    # origin at the bottom edge, card in the XZ plane facing -Y
    import mathutils
    o.data.transform(mathutils.Matrix.Translation((0, 0, 0.5)) @ mathutils.Matrix.Rotation(math.radians(90), 4, "X"))
    o.location = loc
    o.data.materials.append(flame_material(f"{name}-m", seed))
    flames.append((o, w, h, gain))
    return o

ring = [(-1.05, 0.25), (-0.5, 0.45), (0.05, 0.3), (0.6, 0.45), (1.1, 0.2), (-0.25, 0.75), (0.35, 0.8)]
for i, (fx, fy) in enumerate(ring):
    flame_card(f"flame{i}", (fx, fy, 0.0), 1.5 + random.random() * 0.5, 1.9 + random.random() * 0.9, seed=i * 3.1, gain=1.0)
for i in range(2):  # low tongues licking the front edge of the pile
    flame_card(f"front{i}", (-0.45 + i * 0.9, -0.2, 0.0), 1.2, 0.9, seed=20 + i * 2.3, gain=0.7, front=True)
# the wall: wide cards near the camera that only rise at the very end
wall = []
for i in range(6):
    w = flame_card(f"wall{i}", (-2.4 + i * 0.95, -2.6, -0.2), 2.2, 3.5, seed=40 + i * 1.7, gain=0.0)
    wall.append(w)

# scale keys: height follows the ignition curve, with per-card variation and flicker
for o, w, h, gain in flames:
    is_wall = o.name.startswith("wall")
    for f in range(1, TOTAL + 1, 2):
        s = (f - 1) / FPS
        g = ign(s)
        if is_wall:
            k = max(0.0, (g - 2.0) / 4.0)  # 0 → 1 during the final surge
            sx, sz = w * (0.2 + k), h * k * 1.25
        else:
            fl = 1 + 0.12 * math.sin(s * 9 + hash(o.name) % 7) + 0.06 * math.sin(s * 23 + hash(o.name) % 5)
            sx = w * min(1.4, 0.35 + g * 0.5)
            sz = h * min(3.2, g) * gain * fl
        o.scale = (max(1e-3, sx), 1, max(1e-3, sz))
        o.keyframe_insert("scale", frame=f)
    c = o.constraints.new("TRACK_TO")  # billboard toward camera (set after camera exists)

# ---------------------------------------------------------------------------- firelight
lights = []
for i, (lx, ly, lz) in enumerate([(-0.4, 0.0, 0.5), (0.4, 0.1, 0.6), (0.0, -0.3, 0.9)]):
    ld = bpy.data.lights.new(f"fire{i}", "POINT")
    ld.color = (1.0, 0.5, 0.18)
    ld.shadow_soft_size = 0.25
    lo = bpy.data.objects.new(f"fire{i}", ld)
    lo.location = (lx, ly, lz)
    sc.collection.objects.link(lo)
    for f in range(1, TOTAL + 1, 2):
        s = (f - 1) / FPS
        fl = 0.8 + 0.2 * math.sin(s * 13 + i * 2) + 0.1 * math.sin(s * 31 + i)
        ld.energy = 25 + 520 * min(ign(s), 3.0) * fl
        ld.keyframe_insert("energy", frame=f)
rim = bpy.data.lights.new("dusk-rim", "AREA")
rim.color = (0.55, 0.32, 0.22)
rim.energy = 140
rim.size = 6
ro = bpy.data.objects.new("dusk-rim", rim)
ro.location = (-3, 6, 4)
ro.rotation_euler = (math.radians(-55), 0, math.radians(200))
sc.collection.objects.link(ro)

# ---------------------------------------------------------------------------- embers (particles)
em_m, en, el = material("ember")
ee = en.new("ShaderNodeEmission")
ee.inputs["Color"].default_value = LIGHT
ee.inputs["Strength"].default_value = 12
eo = en.new("ShaderNodeOutputMaterial")
el.new(ee.outputs[0], eo.inputs["Surface"])
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.03, location=(0, 0, -5))
ember = bpy.context.active_object
ember.data.materials.append(em_m)
bpy.ops.mesh.primitive_circle_add(radius=1.0, fill_type="NGON", location=(0, 0, 0.4))
emitter = bpy.context.active_object
emitter.scale = (1.1, 0.5, 1)
ps = emitter.modifiers.new("embers", "PARTICLE_SYSTEM").particle_system.settings
ps.count = 160
ps.frame_start = fr(T["anabeta1"])
ps.frame_end = TOTAL
ps.lifetime = 34
ps.lifetime_random = 0.5
ps.emit_from = "FACE"
ps.normal_factor = 0.0
ps.object_align_factor = (0, 0, 0.55)
ps.factor_random = 0.9
ps.effector_weights.gravity = 0.0
ps.render_type = "OBJECT"
ps.instance_object = ember
ps.particle_size = 1.0
ps.size_random = 0.6
emitter.hide_render = False
emitter.show_instancer_for_render = False
bpy.ops.object.effector_add(type="TURBULENCE", location=(0, 0, 2))
turb = bpy.context.active_object
turb.field.strength = 0.9
turb.field.size = 0.8

# ---------------------------------------------------------------------------- paper planes taking off on "anapita"
pm, pn, pl = material("plane")
pb = pn.new("ShaderNodeBsdfPrincipled")
pb.inputs["Base Color"].default_value = PAPER
pb.inputs["Roughness"].default_value = 0.8
pb.inputs["Emission Color"].default_value = PAPER
pb.inputs["Emission Strength"].default_value = 0.35
po = pn.new("ShaderNodeOutputMaterial")
pl.new(pb.outputs[0], po.inputs[0])
plane_mesh = bpy.data.meshes.new("paperplane")
verts = [(0, 0.42, 0), (-0.26, -0.18, 0.03), (0, -0.14, 0), (0.26, -0.18, 0.03), (0, -0.16, -0.08)]
plane_mesh.from_pydata(verts, [], [(0, 1, 2), (0, 2, 3), (0, 2, 4)])
plane_mesh.materials.append(pm)
for wave, at in enumerate((T["anapita1"], T["anapita2"])):
    for k in range(5):
        o = new_obj(f"pp{wave}-{k}", plane_mesh)
        sx = -0.8 + k * 0.4 + random.uniform(-0.1, 0.1)
        start = fr(at + k * 0.07)
        dirx = 1 if k % 2 else -1
        o.location = (sx, 0, -3)  # hidden below until launch
        o.keyframe_insert("location", frame=max(1, start - 1))
        o.location = (sx, 0.05, 1.0)
        o.rotation_euler = (math.radians(70), 0, math.radians(dirx * 20))
        o.keyframe_insert("location", frame=start)
        o.keyframe_insert("rotation_euler", frame=start)
        o.location = (sx + dirx * (1.2 + k * 0.2), 1.5, 5.5)
        o.rotation_euler = (math.radians(60), math.radians(dirx * 25), math.radians(dirx * 35))
        o.keyframe_insert("location", frame=min(TOTAL, start + 50))
        o.keyframe_insert("rotation_euler", frame=min(TOTAL, start + 50))

# ---------------------------------------------------------------------------- camera
cd = bpy.data.cameras.new("cam")
cd.lens = 30
cd.sensor_fit = "VERTICAL"
cd.sensor_height = 36
cd.dof.use_dof = True
cd.dof.focus_object = cam_target
cd.dof.aperture_fstop = 3.2
cam = bpy.data.objects.new("cam", cd)
sc.collection.objects.link(cam)
sc.camera = cam
tt = cam.constraints.new("TRACK_TO")
tt.target = cam_target
tt.track_axis = "TRACK_NEGATIVE_Z"
tt.up_axis = "UP_Y"
for f, loc, tgt in ((1, (0.15, -7.4, 2.0), (0, 0, 0.85)), (fr(T["anapita2"]), (0.0, -5.9, 1.55), (0, 0, 1.0)), (TOTAL, (0.0, -4.6, 1.3), (0, 0, 1.3))):
    cam.location = loc
    cam.keyframe_insert("location", frame=f)
    cam_target.location = tgt
    cam_target.keyframe_insert("location", frame=f)
# billboard the flame cards toward the camera (Z-up, only rotate around Z)
for o, *_ in flames:
    c = o.constraints[-1]
    c.target = cam
    c.track_axis = "TRACK_NEGATIVE_Y"
    c.up_axis = "UP_Z"
    o.rotation_euler = (0, 0, 0)

# final frames: pure orange to hand over to the finale
om, on, ol = material("orange-out")
oe = on.new("ShaderNodeEmission")
oe.inputs["Color"].default_value = ORANGE
oe.inputs["Strength"].default_value = 1.0
otr = on.new("ShaderNodeBsdfTransparent")
omix = on.new("ShaderNodeMixShader")
oo = on.new("ShaderNodeOutputMaterial")
ol.new(otr.outputs[0], omix.inputs[1]); ol.new(oe.outputs[0], omix.inputs[2]); ol.new(omix.outputs[0], oo.inputs["Surface"])
for f, v in ((max(1, TOTAL - 10), 0.0), (TOTAL, 1.0)):
    omix.inputs[0].default_value = v
    omix.inputs[0].keyframe_insert("default_value", frame=f)
bpy.ops.mesh.primitive_plane_add(size=2)
card = bpy.context.active_object
card.data.materials.append(om)
card.parent = cam
card.location = (0, 0, -0.3)
card.rotation_euler = (0, 0, 0)

print(f"rendering frames {FRAMES} at {SCALE}% with {SAMPLES} samples → {OUT}")
bpy.ops.render.render(animation=True)
print("done")
