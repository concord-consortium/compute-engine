---
title: Trigonometry
permalink: /compute-engine/reference/trigonometry/
layout: single
date: Last Modified
sidebar:
  - nav: 'compute-engine'
---
# Trigonometry

## Constants

<div class=symbols-table>

| Symbol | Value |
| :--- | :--- |
|`Degrees`| \\[ \frac{\pi}{180} = 0.017453292519943295769236907\ldots \\] |
| `MinusDoublePi` | \\[ -2\pi \\] | | 
| `MinusPi` | \\[ -\pi \\] | | 
| `MinusHalfPi` | \\[ -\frac{\pi}{2} \\] | | 
| `QuarterPi` | \\[ \frac{\pi}{4} \\] | | 
| `ThirdPi` | \\[ \frac{\pi}{3} \\] | | 
| `HalfPi` | \\[ \frac{\pi}{2} \\] | | 
| `TwoThirdPi` | \\[ 2\times \frac{\pi}{3} \\] | | 
| `ThreeQuarterPi` | \\[ 3\times \frac{\pi}{4} \\] | | 
| `Pi` | \\[ \pi \approx 3.14159265358979323\ldots \\] | |
| `DoublePi` | \\[ 2\pi \\] | | 

</div>

## Trigonometric Functions

| Function | Inverse                                                                                                | Hyperbolic | Area Hyperbolic |
| :------- | :----------------------------------------------------------------------------------------------------- | :--------- | :----------------- |
| `Sin`    | `Arcsin`                                                                                               | `Sinh`     | `Arsinh`           |
| `Cos`    | `Arccos`                                                                                               | `Cosh`     | `Arcosh`           |
| `Tan`    | [`Arctan`](https://www.wikidata.org/wiki/Q2257242) [`Arctan2`](https://www.wikidata.org/wiki/Q776598) | `Tanh`     | `Artanh`           |
| `Cot`    | `Acot`                                                                                               | `Coth`     | `Arcoth`           |
| `Sec`    | `Asec`                                                                                               | `Sech`     | `Asech`           |
| `Csc`    | `Acsc`                                                                                               | `Csch`     | `Acsch`           |



<div class=symbols-table>

| Function | |
| :--- | :--- | 
| `FromPolarCoordinates` | Converts \\( (\operatorname{radius}, \operatorname{angle}) \longrightarrow (x, y)\\)|
| `ToPolarCoordinates` | Converts \\((x, y) \longrightarrow (\operatorname{radius}, \operatorname{angle})\\)|
| `Hypot` | \\(\operatorname{Hypot}(x,y) = \sqrt{x^2+y^2}\\) |
| `Haversine` | \\( \operatorname{Haversine}(z) = \sin(\frac{z}{2})^2 \\).<br>The  [Haversine function](https://www.wikidata.org/wiki/Q2528380) was important in  navigation because it appears in the haversine formula, which is used to  reasonably accurately compute distances on an astronomic spheroid given angular positions (e.g., longitude and latitude).|
| `InverseHaversine` |\\(\operatorname{InverseHaversine}(z) = 2 \operatorname{Arcsin}(\sqrt{z})\\) |

</div>