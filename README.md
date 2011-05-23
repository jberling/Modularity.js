# Modularity.js 0.1
One challenge when developing JavaScript heavy web sites/applications is to organize them in a good way.
Modularity.js approaches this problem with the help of a couple of great JavaScript projects and then add some own ideas
on top of that.

## Declarative
The idea is to declare more things in your markup. This is an example:

    <html lang="en">
      <head>
        <title>Silly Example</title>
        .
        .
        .
        <script data-main="scripts/bootstrap.js" src="scripts/require.js"></script>
      </head>
      <!-- The routes below is handled by a Backbone.js controller -->
      <body id="controller" data-controller='{
        ""            : [ "welcome:article" ],
        "about"       : [ "about:article" ],
        "inspiration" : [ "inspiration:article" ]
      }'>
        <div id="page">
          <!-- this module turns the menu into a dropdown menu. It's unaffected by the controller. -->
          <nav data-menu='{ "effect": "slide" }'>
            <ul>
              <li><a href="#">Welcome</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#inspiration">Inpsiration</a></li>
            </ul>
          </nav>

          <!--
            These divs are bound to an article module. The controller decides if they should be visible or not.
            The module checks the div id to decide which content to load.
          -->
          <div id="welcome" data-article='{}'></div>
          <div id="about" data-article='{}'></div>
          <div id="inspiration" data-article='{}'></div>
        </div>
      </body>
    </html>

## Module
The module is central to Modularity.js. It's based on this pattern. The article module in the above example looks
like this:
        
    define([
      "scripts/lib/Modularity",
      "templates/collection"
      ], function(Modularity, collection) {

      return Modularity.moduleDefinitions.register("article", {

        // This function is run when a module is created.
        start: function(options) {
          var articleName = this.id.split(":")[0];
          var content = articles[options.name || articleName];
          $(this.element).hide();
          $(this.element).html(content);
          $(this.element).fadeIn("slow");
        },

        // This is run when the module is destroyed.
        destroy: function() {
          $(this.element).fadeOut("slow", function(){
            $(this.element).html("");
          });
        }

      }, { dataAttribute: "article" });

    });

## But, I'm not creating a single page application!
I hear you! If you are writing a more traditional web site, Modularity.js can still be an interesting choice. You don't
need to use the controller. Just use the data-attribute feature of Modularity.js and enjoy the simplified development.

Like this:

    <html lang="en">
      <head>
        <title>Enhance me</title>
        .
        .
        .
        <script data-main="scripts/main.js" src="scripts/require.js"></script>
      </head>
      <body>
        <nav data-mega-dropdown='{ "effect" : "fade" }'>'
          <h1>Navigation</h1>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/company">The Company</a>
              <div>
                <h2>About</h2>
                <ul>
                  <li><a href="/company/today">Today</a></li>
                  <li><a href="/company/history">History</a></li>
                  <li><a href="/company/future">Future</a></li>
                </ul>
                <h2>Products</h2>
                <ul>
                  <li><a href="/company/products/mega-mover">Mega Mover</a></li>
                  <li><a href="/company/products/explorer">Explorer</a></li>
                  <li><a href="/company/products/erazor">Erazor</a></li>
                </ul>
              </div>
            </li>
            .
            .
            .
          </ul>
        </nav>
        <div id="main-content">
          .
          .
          .
        </div>
      </body>
    </html>

## Dependencies

### RequireJS
RequireJS allows you to divide your project into smaller parts in a clever way.

### Backbone.js
Backbone.js is a great project. Modularity.js adds a more modular thinking to the mix.

###jQuery and Underscore.js
Those two libraries offers a good "infra structure" to base the code on.

## Road map
Modularity.js is still in its infancy. It kind of works, but is probably not very stable. The idea is still developing
rapidly. Hopefully its already interesting interesting enough to draw some attention and luring other developers to
contribute.

## Other inspiration
* http://developer.yahoo.com/yui/theater/video.php?v=zakas-architecture