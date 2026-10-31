# Original instrumental loop: pulsing bass and minor string-like pads.
import numpy as np, wave
rate=24000; duration=32; t=np.arange(rate*duration)/rate; mix=np.zeros(len(t))
for start,notes in [(0,[45,52,57,60]),(8,[41,48,53,57]),(16,[38,45,50,53]),(24,[40,47,52,56])]:
 u=t-start; env=np.clip(u/.6,0,1)*np.clip((8-u)/.6,0,1)*(u>=0)*(u<8)
 for note in notes:
  f=440*2**((note-69)/12)
  mix+=env*.025*(np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*f*2*t))*(.8+.2*np.sin(2*np.pi*5*t))
for beat in np.arange(0,duration,.5):
 u=t-beat; env=np.exp(-np.maximum(u,0)*15)*(u>=0)*(u<.45)
 mix+=.14*env*np.sin(2*np.pi*55*u)
mix*=np.minimum(t/.05,1)*np.minimum((duration-t)/.05,1)
with wave.open('/tmp/suspense-bed.wav','wb') as w:
 w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes())
