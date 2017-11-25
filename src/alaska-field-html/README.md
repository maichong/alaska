# alaska-field-html
Alaska html WYSIWYG editor field

```javascript
//alaska config

export default {

  'alaska-field-html': {
    /**
     * WYSIWYG editor upload image
     * @type {object|null}
     */
    upload: {
      service: 'alaska-user',
      model: 'User',
      path: 'avatar',
      //messages will be shown if one leave the page while file is being uploaded;
      leaveConfirm: 'Uploading is in progress, are you sure to leave this page?'
    },
    //Default image placeholder. Used when inserting pictures in Simditor.
    defaultImage: 'images/image.png'
  }

}
```
