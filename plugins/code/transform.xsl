<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="no" omit-xml-declaration="yes" />
  
  <xsl:template match="code">
    <pre>
      <xsl:apply-templates />
    </pre>
  </xsl:template>
  
</xsl:stylesheet>
