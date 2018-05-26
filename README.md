# Node Red Regression

A Node Red node to perform least squares regression fitting on a flow using the linear regression functions in the [regression-js](https://www.npmjs.com/package/regression) library.  The regression functions supported are:

  * linear - y = mx + c
  * exponential - y = ae^bx
  * logarithmic - y = a + b ln x
  * power - y = ax^b
  * polynomial - ax^n + .... + ax + a

If `x` and `y` both contain values then they are saved as a point into the data set.  The `x` may also
contain an array of `[x,y]` points which will be saved into the data set.  If `data set size` is greater
that 0 then the size of the data set will be limited to the numer of elements specified, with the oldest
elements dropped first.
        
Once enough points are stored in the data set, a line equation will be generated using linear regression.
This equation can be output as an object containing the coefficients of the equation, a text
representation of the equation, the coefficient of determination, and a function that implements the
equation.
        
For every input containing a value in the`x`, a value for `y` will be calculated.  The input `y` value
can be replaced with the calculated `y` value as a basic noise reduction function.


