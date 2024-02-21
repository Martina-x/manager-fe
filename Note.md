### 项目初始化

```json
{
  "scripts": {
    "dev": "vite --mode dev",
  },
}

```

```js
// .env.dev
NODE_ENV=development
VITE_name=SATAA
```

![](https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240221223215888.png)

![image-20240221223238778](https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240221223238778.png)

之所以``MODE`的值为`dev`是因为package.json`的配置优先级高于项目的优先级。

另外，当`.env.dev`文件中设置的`MODE_ENV`的值为除了`development`的其他值外，会有报错提示

![image-20240221223943252](https://gitee.com/martina-x/my-drawing-bed/raw/master/image-20240221223943252.png)



