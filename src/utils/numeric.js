/*
The following functions (besides mul, div, pow, and sqrt)
come from numeric.js library created by Sébastien Loisel:
https://github.com/sloisel/numeric
*/

const epsilon = 2.220446049250313e-16
export function svd(A) {
  var temp
  //Compute the thin SVD from G. H. Golub and C. Reinsch, Numer. Math. 14, 403-420 (1970)
  var prec = epsilon //Math.pow(2,-52) // assumes double prec
  var tolerance = 1e-64 / prec
  var itmax = 50
  var c = 0
  var i = 0
  var j = 0
  var k = 0
  var l = 0

  var u = clone(A)
  var m = u.length

  var n = u[0].length

  if (m < n) throw 'Need more rows than columns'

  var e = new Array(n)
  var q = new Array(n)
  for (i = 0; i < n; i++) e[i] = q[i] = 0.0
  var v = rep([n, n], 0)
  //	v.zero();

  function pythag(a, b) {
    a = Math.abs(a)
    b = Math.abs(b)
    if (a > b) return a * Math.sqrt(1.0 + (b * b) / a / a)
    else if (b == 0.0) return a
    return b * Math.sqrt(1.0 + (a * a) / b / b)
  }

  //Householder's reduction to bidiagonal form

  var f = 0.0
  var g = 0.0
  var h = 0.0
  var x = 0.0
  var y = 0.0
  var z = 0.0
  var s = 0.0

  for (i = 0; i < n; i++) {
    e[i] = g
    s = 0.0
    l = i + 1
    for (j = i; j < m; j++) s += u[j][i] * u[j][i]
    if (s <= tolerance) g = 0.0
    else {
      f = u[i][i]
      g = Math.sqrt(s)
      if (f >= 0.0) g = -g
      h = f * g - s
      u[i][i] = f - g
      for (j = l; j < n; j++) {
        s = 0.0
        for (k = i; k < m; k++) s += u[k][i] * u[k][j]
        f = s / h
        for (k = i; k < m; k++) u[k][j] += f * u[k][i]
      }
    }
    q[i] = g
    s = 0.0
    for (j = l; j < n; j++) s = s + u[i][j] * u[i][j]
    if (s <= tolerance) g = 0.0
    else {
      f = u[i][i + 1]
      g = Math.sqrt(s)
      if (f >= 0.0) g = -g
      h = f * g - s
      u[i][i + 1] = f - g
      for (j = l; j < n; j++) e[j] = u[i][j] / h
      for (j = l; j < m; j++) {
        s = 0.0
        for (k = l; k < n; k++) s += u[j][k] * u[i][k]
        for (k = l; k < n; k++) u[j][k] += s * e[k]
      }
    }
    y = Math.abs(q[i]) + Math.abs(e[i])
    if (y > x) x = y
  }

  // accumulation of right hand gtransformations
  for (i = n - 1; i != -1; i += -1) {
    if (g != 0.0) {
      h = g * u[i][i + 1]
      for (j = l; j < n; j++) v[j][i] = u[i][j] / h
      for (j = l; j < n; j++) {
        s = 0.0
        for (k = l; k < n; k++) s += u[i][k] * v[k][j]
        for (k = l; k < n; k++) v[k][j] += s * v[k][i]
      }
    }
    for (j = l; j < n; j++) {
      v[i][j] = 0
      v[j][i] = 0
    }
    v[i][i] = 1
    g = e[i]
    l = i
  }

  // accumulation of left hand transformations
  for (i = n - 1; i != -1; i += -1) {
    l = i + 1
    g = q[i]
    for (j = l; j < n; j++) u[i][j] = 0
    if (g != 0.0) {
      h = u[i][i] * g
      for (j = l; j < n; j++) {
        s = 0.0
        for (k = l; k < m; k++) s += u[k][i] * u[k][j]
        f = s / h
        for (k = i; k < m; k++) u[k][j] += f * u[k][i]
      }
      for (j = i; j < m; j++) u[j][i] = u[j][i] / g
    } else for (j = i; j < m; j++) u[j][i] = 0
    u[i][i] += 1
  }

  // diagonalization of the bidiagonal form
  prec = prec * x
  for (k = n - 1; k != -1; k += -1) {
    for (var iteration = 0; iteration < itmax; iteration++) {
      // test f splitting
      var test_convergence = false
      for (l = k; l != -1; l += -1) {
        if (Math.abs(e[l]) <= prec) {
          test_convergence = true
          break
        }
        if (Math.abs(q[l - 1]) <= prec) break
      }
      if (!test_convergence) {
        // cancellation of e[l] if l>0
        c = 0.0
        s = 1.0
        var l1 = l - 1
        for (i = l; i < k + 1; i++) {
          f = s * e[i]
          e[i] = c * e[i]
          if (Math.abs(f) <= prec) break
          g = q[i]
          h = pythag(f, g)
          q[i] = h
          c = g / h
          s = -f / h
          for (j = 0; j < m; j++) {
            y = u[j][l1]
            z = u[j][i]
            u[j][l1] = y * c + z * s
            u[j][i] = -y * s + z * c
          }
        }
      }
      // test f convergence
      z = q[k]
      if (l == k) {
        //convergence
        if (z < 0.0) {
          //q[k] is made non-negative
          q[k] = -z
          for (j = 0; j < n; j++) v[j][k] = -v[j][k]
        }
        break //break out of iteration loop and move on to next k value
      }
      if (iteration > itmax - 1)
        throw new Error('numeric.js, svd(): no convergence')
      // shift from bottom 2x2 minor
      x = q[l]
      y = q[k - 1]
      g = e[k - 1]
      h = e[k]
      f = ((y - z) * (y + z) + (g - h) * (g + h)) / (2.0 * h * y)
      g = pythag(f, 1.0)
      if (f < 0.0) f = ((x - z) * (x + z) + h * (y / (f - g) - h)) / x
      else f = ((x - z) * (x + z) + h * (y / (f + g) - h)) / x
      // next QR transformation
      c = 1.0
      s = 1.0
      for (i = l + 1; i < k + 1; i++) {
        g = e[i]
        y = q[i]
        h = s * g
        g = c * g
        z = pythag(f, h)
        e[i - 1] = z
        c = f / z
        s = h / z
        f = x * c + g * s
        g = -x * s + g * c
        h = y * s
        y = y * c
        for (j = 0; j < n; j++) {
          x = v[j][i - 1]
          z = v[j][i]
          v[j][i - 1] = x * c + z * s
          v[j][i] = -x * s + z * c
        }
        z = pythag(f, h)
        q[i - 1] = z
        c = f / z
        s = h / z
        f = c * g + s * y
        x = -s * g + c * y
        for (j = 0; j < m; j++) {
          y = u[j][i - 1]
          z = u[j][i]
          u[j][i - 1] = y * c + z * s
          u[j][i] = -y * s + z * c
        }
      }
      e[l] = 0.0
      e[k] = f
      q[k] = x
    }
  }

  //vt= transpose(v)
  //return (u,q,vt)
  for (i = 0; i < q.length; i++) if (q[i] < prec) q[i] = 0

  //sort eigenvalues
  for (i = 0; i < n; i++) {
    //writeln(q)
    for (j = i - 1; j >= 0; j--) {
      if (q[j] < q[i]) {
        //  writeln(i,'-',j)
        c = q[j]
        q[j] = q[i]
        q[i] = c
        for (k = 0; k < u.length; k++) {
          temp = u[k][i]
          u[k][i] = u[k][j]
          u[k][j] = temp
        }
        for (k = 0; k < v.length; k++) {
          temp = v[k][i]
          v[k][i] = v[k][j]
          v[k][j] = temp
        }
        //	   u.swapCols(i,j)
        //	   v.swapCols(i,j)
        i = j
      }
    }
  }

  return { U: u, S: q, V: v }
}

function clone(A, k, n) {
  if (typeof k === 'undefined') {
    k = 0
  }
  if (typeof n === 'undefined') {
    n = dim(A).length
  }
  var i,
    ret = Array(A.length)
  if (k === n - 1) {
    for (i in A) {
      if (Object.getOwnPropertyDescriptor(A, i)) ret[i] = A[i]
    }
    return ret
  }
  for (i in A) {
    if (Object.getOwnPropertyDescriptor(A, i)) ret[i] = clone(A[i], k + 1, n)
    ret[i] = clone(A[i], k + 1, n)
  }
  return ret
}

function rep(s, v, k) {
  if (typeof k === 'undefined') {
    k = 0
  }
  var n = s[k],
    ret = Array(n),
    i
  if (k === s.length - 1) {
    for (i = n - 2; i >= 0; i -= 2) {
      ret[i + 1] = v
      ret[i] = v
    }
    if (i === -1) {
      ret[0] = v
    }
    return ret
  }
  for (i = n - 1; i >= 0; i--) {
    ret[i] = rep(s, v, k + 1)
  }
  return ret
}

function dim(A, ret, k) {
  if (typeof ret === 'undefined') {
    ret = []
  }
  if (typeof A !== 'object') return ret
  if (typeof k === 'undefined') {
    k = 0
  }
  if (!(k in ret)) {
    ret[k] = 0
  }
  if (A.length > ret[k]) ret[k] = A.length
  var i
  for (i in A) {
    if (Object.getOwnPropertyDescriptor(A, i)) dim(A[i], ret, k + 1)
  }
  return ret
}

export function mul(n, A) {
  if (typeof A === 'number') {
    return A * n
  } else if (A.length) {
    if (A[0].length) {
      // A is a matrix
      return A.map((row) => row.map((element) => element * n))
    } else {
      // A is an array
      if (n.length && A.length === n.length) {
        // n is also an array
        return A.map((element, i) => element * n[i])
      } else {
        return A.map((element) => element * n)
      }
    }
  } else {
    throw new Error(
      `Invalid input. A is ${A}, and n is ${n}. A should be a number, array of numbers, or matrix of numbers.`
    )
  }
}
export function div(A, n) {
  if (typeof A === 'number') {
    return A / n
  } else if (A.length) {
    if (A[0].length) {
      // A is a matrix
      return A.map((row) => row.map((element) => element / n))
    } else {
      // A is an array
      if (n.length && A.length === n.length) {
        // n is also an array
        return A.map((element, i) => element / n[i])
      } else {
        return A.map((element) => element / n)
      }
    }
  } else {
    throw new Error(
      `Invalid input. A is ${A}, and n is ${n}. A should be a number, array of numbers, or matrix of numbers.`
    )
  }
}

export function pow(A, n) {
  if (typeof A === 'number') {
    return Math.pow(A, n)
  } else if (A.length) {
    if (A[0].length) {
      // A is a matrix
      return A.map((row) => row.map((element) => Math.pow(element, n)))
    } else {
      // A is an array
      return A.map((element) => Math.pow(element, n))
    }
  } else {
    throw new Error(
      `Invalid input. A is ${A}, and n is ${n}. A should be a number, array of numbers, or matrix of numbers.`
    )
  }
}

export function sqrt(A) {
  if (typeof A === 'number') {
    return Math.sqrt(A)
  } else if (A.length) {
    if (A[0].length) {
      // A is a matrix
      return A.map((row) => row.map((element) => Math.sqrt(element)))
    } else {
      // A is an array
      return A.map((element) => Math.sqrt(element))
    }
  } else {
    throw new Error(
      `Invalid input. A is ${A}. A should be a number, array of numbers, or matrix of numbers.`
    )
  }
}

export function sum(x, s, k) {
  var accum = 0
  if (typeof x !== 'object') {
    xi = x
    accum += xi
    return accum
  }
  if (typeof s === 'undefined') s = dim(x)
  if (typeof k === 'undefined') k = 0
  if (k === s.length - 1) return sumV(x)
  var xi
  var n = x.length,
    i
  for (i = n - 1; i !== -1; --i) {
    xi = sum(x[i])
    accum += xi
  }
  return accum
}

function sumV(x) {
  var n = x.length
  var i, xi
  var accum = 0
  for (i = n - 1; i !== -1; --i) {
    xi = x[i]
    accum += xi
  }
  return accum
}

export function add() {
  var n = arguments.length,
    i,
    x = arguments[0],
    y

  for (i = 1; i !== n; ++i) {
    y = arguments[i]
    if (typeof x === 'object') {
      if (typeof y === 'object') x = _biforeach2(x, y, dim(x), 0, addVV)
      else x = _biforeach2(x, y, dim(x), 0, addVS)
    } else if (typeof y === 'object') x = _biforeach2(x, y, dim(y), 0, addSV)
    else x += y
  }
  return x
}

function addVV(x, y) {
  var _n = y.length
  var i,
    ret = Array(_n)

  for (i = _n - 1; i !== -1; --i) {
    ret[i] = x[i] + y[i]
  }
  return ret
}
function addVS(x, y) {
  var _n = x.length
  var i,
    ret = Array(_n)

  for (i = _n - 1; i !== -1; --i) {
    ret[i] = x[i] + y
  }
  return ret
}
function addSV(x, y) {
  var _n = y.length
  var i,
    ret = Array(_n)

  for (i = _n - 1; i !== -1; --i) {
    ret[i] = x + y[i]
  }
  return ret
}
function _biforeach2(x, y, s, k, f) {
  if (k === s.length - 1) {
    return f(x, y)
  }
  var i,
    n = s[k],
    ret = Array(n)
  for (i = n - 1; i >= 0; --i) {
    ret[i] = _biforeach2(
      typeof x === 'object' ? x[i] : x,
      typeof y === 'object' ? y[i] : y,
      s,
      k + 1,
      f
    )
  }
  return ret
}

export function transpose(x) {
  var i,
    j,
    m = x.length,
    n = x[0].length,
    ret = Array(n),
    A0,
    A1,
    Bj
  for (j = 0; j < n; j++) ret[j] = Array(m)
  for (i = m - 1; i >= 1; i -= 2) {
    A1 = x[i]
    A0 = x[i - 1]
    for (j = n - 1; j >= 1; --j) {
      Bj = ret[j]
      Bj[i] = A1[j]
      Bj[i - 1] = A0[j]
      --j
      Bj = ret[j]
      Bj[i] = A1[j]
      Bj[i - 1] = A0[j]
    }
    if (j === 0) {
      Bj = ret[0]
      Bj[i] = A1[0]
      Bj[i - 1] = A0[0]
    }
  }
  if (i === 0) {
    A0 = x[0]
    for (j = n - 1; j >= 1; --j) {
      ret[j][0] = A0[j]
      --j
      ret[j][0] = A0[j]
    }
    if (j === 0) {
      ret[0][0] = A0[0]
    }
  }
  return ret
}
